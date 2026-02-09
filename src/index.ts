import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { StorageFactory, StorageType, StorageOptions } from './storage/index.js';
import { ContextService } from './context/service.js';
import { createRoutes } from './api/routes.js';
import { KleverMCPServer } from './mcp/server.js';
import { autoIngestKnowledge } from './utils/auto-ingest.js';
import { getVersionInfo } from './version.js';

// Load environment variables
dotenv.config();

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
  const mcpServer = new KleverMCPServer(contextService);
  await mcpServer.start();
}

async function startPublicServer() {
  // Lazy-import SDK transport types (only needed for public mode)
  const { StreamableHTTPServerTransport } = await import(
    '@modelcontextprotocol/sdk/server/streamableHttp.js'
  );
  const { isInitializeRequest } = await import('@modelcontextprotocol/sdk/types.js');
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
  app.use((req, res, next) => {
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

  // Session tracking: sessionId -> transport
  const sessions = new Map<string, InstanceType<typeof StreamableHTTPServerTransport>>();

  // Session cleanup interval (30 min TTL)
  const SESSION_TTL_MS = 30 * 60 * 1000;
  const sessionTimestamps = new Map<string, number>();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [sessionId, lastSeen] of sessionTimestamps.entries()) {
      if (now - lastSeen > SESSION_TTL_MS) {
        const transport = sessions.get(sessionId);
        if (transport) {
          transport.close().catch(() => {});
          sessions.delete(sessionId);
        }
        sessionTimestamps.delete(sessionId);
        console.error(`[Public] Cleaned up stale session: ${sessionId}`);
      }
    }
  }, 60 * 1000);

  // MCP endpoint — Streamable HTTP
  app.all('/mcp', mcpLimiter, async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      // Handle new session (initialization)
      if (req.method === 'POST') {
        const body = req.body;

        if (!sessionId) {
          // Check if this is an initialize request
          if (isInitializeRequest(body)) {
            // Create a new transport for this session
            const transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (sid: string) => {
                sessions.set(sid, transport);
                sessionTimestamps.set(sid, Date.now());
                console.error(`[Public] New MCP session: ${sid}`);
              },
            });

            // Create a public-profile MCP server and connect the transport
            const mcpServer = new KleverMCPServer(contextService, 'public');
            await mcpServer.connectTransport(transport);

            // Handle the request
            await transport.handleRequest(req, res, body);
            return;
          }

          // Non-init request without session ID
          res.status(400).json({ error: 'Missing mcp-session-id header' });
          return;
        }

        // Existing session
        const transport = sessions.get(sessionId);
        if (!transport) {
          res.status(404).json({ error: 'Session not found' });
          return;
        }
        sessionTimestamps.set(sessionId, Date.now());
        await transport.handleRequest(req, res, body);
        return;
      }

      // Handle GET (SSE stream) and DELETE (session termination)
      if (req.method === 'GET' || req.method === 'DELETE') {
        if (!sessionId) {
          res.status(400).json({ error: 'Missing mcp-session-id header' });
          return;
        }

        const transport = sessions.get(sessionId);
        if (!transport) {
          res.status(404).json({ error: 'Session not found' });
          return;
        }
        sessionTimestamps.set(sessionId, Date.now());

        if (req.method === 'DELETE') {
          await transport.handleRequest(req, res);
          sessions.delete(sessionId);
          sessionTimestamps.delete(sessionId);
          console.error(`[Public] Session terminated: ${sessionId}`);
          return;
        }

        await transport.handleRequest(req, res);
        return;
      }

      // Unsupported method
      res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
      console.error('[Public] MCP endpoint error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Read-only API routes
  app.use('/api', apiLimiter, createRoutes(contextService, { readOnly: true }));

  // Health endpoint at root level
  app.get('/health', async (req, res) => {
    try {
      const allContexts = await contextService.query({ limit: 1, offset: 0 });
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: 'public',
        uptime: process.uptime(),
        activeSessions: sessions.size,
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
  const shutdown = async () => {
    console.error('\n[Public] Shutting down gracefully...');
    clearInterval(cleanupInterval);

    // Stop accepting new connections
    server.close();

    // Close all active sessions
    for (const [sessionId, transport] of sessions.entries()) {
      try {
        await transport.close();
      } catch {
        // Ignore close errors during shutdown
      }
      sessions.delete(sessionId);
      sessionTimestamps.delete(sessionId);
    }

    process.exit(0);
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
