import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StorageFactory, StorageType, StorageOptions } from './storage/index.js';
import { ContextService } from './context/service.js';
import { createRoutes } from './api/routes.js';
import { KleverMCPServer } from './mcp/server.js';
import { autoIngestKnowledge } from './utils/auto-ingest.js';
import { getVersionInfo } from './version.js';
import { KleverChainClient } from './chain/index.js';
import type { KleverNetwork } from './chain/types.js';

// Load environment variables
dotenv.config({ quiet: true });

/**
 * Main entry point for Klever MCP Server
 *
 * Supports three modes:
 * 1. HTTP API server for REST access
 * 2. MCP server for AI assistant integration (stdio)
 * 3. Public server for hosted MCP + read-only API (HTTP Streamable transport)
 */

function createStorageAndService() {
  const storageType = (process.env.STORAGE_TYPE as StorageType) || 'memory';
  const storageOptions: StorageOptions = {
    redis: {
      url: process.env.REDIS_URL,
    },
    memory: {
      maxSize: parseInt(process.env.MEMORY_MAX_SIZE || '10000'),
    },
  };
  const storage = StorageFactory.create(storageType, storageOptions);
  const contextService = new ContextService(storage);
  return { storageType, contextService };
}

const VALID_NETWORKS = new Set(['mainnet', 'testnet', 'devnet', 'local']);

function createChainClient(): KleverChainClient {
  const envNetwork = process.env.KLEVER_NETWORK;
  if (envNetwork && !VALID_NETWORKS.has(envNetwork)) {
    // In MCP mode stdout is reserved for the JSON-RPC protocol; stderr is the only safe log channel.
    console.error(
      `[WARN] Invalid KLEVER_NETWORK="${envNetwork}". Valid: mainnet, testnet, devnet, local. Defaulting to mainnet.`
    );
  }
  const network: KleverNetwork =
    envNetwork && VALID_NETWORKS.has(envNetwork) ? (envNetwork as KleverNetwork) : 'mainnet';
  return new KleverChainClient({
    network,
    nodeUrl: process.env.KLEVER_NODE_URL,
    apiUrl: process.env.KLEVER_API_URL,
    timeout: parseInt(process.env.KLEVER_TIMEOUT || '15000'),
  });
}

async function startHTTPServer() {
  const { storageType, contextService } = createStorageAndService();

  // Auto-ingest knowledge if using memory storage
  if (storageType === 'memory') {
    await autoIngestKnowledge(contextService);
  }

  // Create Express app
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Routes
  app.use('/api', createRoutes(contextService));

  // Global error handling
  app.use(
    (err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('[ERROR]', new Date().toISOString(), err.stack);

      // Don't leak error details in production
      const isDev = process.env.NODE_ENV === 'development';

      res.status(err.status || 500).json({
        success: false,
        error: err.name || 'Internal server error',
        message: isDev ? err.message : 'An error occurred processing your request',
        ...(isDev && { stack: err.stack }),
      });
    }
  );

  // Start server
  app.listen(port, () => {
    console.log(`Klever MCP HTTP Server running on http://localhost:${port}`);
    console.log(`Storage backend: ${storageType}`);
  });
}

async function startMCPServer() {
  const { storageType, contextService } = createStorageAndService();

  // Auto-ingest knowledge if using memory storage
  if (storageType === 'memory') {
    await autoIngestKnowledge(contextService);
  }

  // Create and start MCP server
  const chainClient = createChainClient();
  const mcpServer = new KleverMCPServer(contextService, 'local', chainClient);
  await mcpServer.start();
}

async function startPublicServer() {
  // Lazy-import SDK transport types (only needed for public mode)
  const { StreamableHTTPServerTransport } = await import(
    '@modelcontextprotocol/sdk/server/streamableHttp.js'
  );
  const rateLimit = (await import('express-rate-limit')).default;

  // Always use in-memory storage for public mode (read-only, no Redis needed)
  const storageOptions: StorageOptions = {
    memory: {
      maxSize: parseInt(process.env.MEMORY_MAX_SIZE || '10000'),
    },
  };
  const storage = StorageFactory.create('memory', storageOptions);
  const contextService = new ContextService(storage);

  // Auto-ingest knowledge base
  await autoIngestKnowledge(contextService);

  // Create Express app
  const app = express();
  const port = process.env.PORT || 3000;

  // Trust proxy (required behind Cloudflare/nginx for correct client IP in rate limiting)
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy !== undefined && trustProxy.toLowerCase() !== 'false') {
    app.set('trust proxy', trustProxy.toLowerCase() === 'true' ? 1 : trustProxy);
  }

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'"
    );
    next();
  });

  // CORS — restrict to necessary headers
  const corsOrigins = process.env.CORS_ORIGINS;
  const corsOriginConfig = !corsOrigins || corsOrigins === '*'
    ? true
    : corsOrigins.split(',').map(o => o.trim());
  app.use(
    cors({
      origin: corsOriginConfig,
      allowedHeaders: ['Content-Type', 'mcp-session-id', 'Last-Event-ID'],
      exposedHeaders: ['mcp-session-id'],
    })
  );

  // Body parser with reduced limit for public mode
  const bodyLimit = process.env.BODY_SIZE_LIMIT || '1mb';
  app.use(express.json({ limit: bodyLimit }));

  // Rate limiting for MCP endpoint
  const parsedMcpRate = parseInt(process.env.RATE_LIMIT_MCP || '60');
  const mcpRateLimitValue = Number.isFinite(parsedMcpRate) ? parsedMcpRate : 60;
  const mcpLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: mcpRateLimitValue,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });

  // Rate limiting for API endpoints
  const parsedApiRate = parseInt(process.env.RATE_LIMIT_API || '30');
  const apiRateLimitValue = Number.isFinite(parsedApiRate) ? parsedApiRate : 30;
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: apiRateLimitValue,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });

  // MCP endpoint — Stateless Streamable HTTP
  // Each request creates its own transport+server and is fully self-contained.
  // No session tracking needed — eliminates "Session not found" errors after
  // container restarts, Watchtower redeployments, or TTL expiry.
  app.post('/mcp', mcpLimiter, async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        transport.close().catch(() => {});
      });

      const chainClient = createChainClient();
      const mcpServer = new KleverMCPServer(contextService, 'public', chainClient);
      await mcpServer.connectTransport(transport);

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('[Public] MCP endpoint error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  // GET and DELETE are not applicable in stateless mode
  app.get('/mcp', mcpLimiter, (_req, res) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Use POST for stateless requests.' },
      id: null,
    });
  });

  app.delete('/mcp', mcpLimiter, (_req, res) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. No sessions to terminate in stateless mode.' },
      id: null,
    });
  });

  // Read-only API routes
  app.use('/api', apiLimiter, createRoutes(contextService, { readOnly: true }));

  // Health endpoint at root level
  app.get('/health', async (_req, res) => {
    try {
      const allContexts = await contextService.query({ limit: 1, offset: 0 });
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: 'public',
        uptime: process.uptime(),
        ...getVersionInfo(),
        knowledgeBase: {
          totalContexts: allContexts.total,
        },
      });
    } catch {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        mode: 'public',
        uptime: process.uptime(),
        ...getVersionInfo(),
      });
    }
  });

  // Global error handling
  app.use(
    (err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('[ERROR]', new Date().toISOString(), err.stack);
      res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  );

  // Start server
  const server = app.listen(port, () => {
    console.log(`Klever MCP Public Server running on http://localhost:${port}`);
    console.log(`MCP endpoint: http://localhost:${port}/mcp`);
    console.log(`API endpoint: http://localhost:${port}/api (read-only)`);
    console.log(`Health check: http://localhost:${port}/health`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.error('\n[Public] Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Determine which mode to run
const mode = process.env.MODE || 'http';

if (mode === 'mcp') {
  startMCPServer().catch(console.error);
} else if (mode === 'public') {
  startPublicServer().catch(console.error);
} else {
  startHTTPServer().catch(console.error);
}
