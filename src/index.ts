import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StorageFactory, StorageType, StorageOptions } from './storage/index.js';
import { ContextService } from './context/service.js';
import { createRoutes } from './api/routes.js';
import { KleverMCPServer } from './mcp/server.js';
import { autoIngestKnowledge } from './utils/auto-ingest.js';

// Load environment variables
dotenv.config();

/**
 * Main entry point for Klever MCP Server
 * 
 * Supports two modes:
 * 1. HTTP API server for REST access
 * 2. MCP server for AI assistant integration
 */

async function startHTTPServer() {
  // Create storage backend with proper options
  const storageType = (process.env.STORAGE_TYPE as StorageType) || 'memory';
  const storageOptions: StorageOptions = {
    redis: {
      url: process.env.REDIS_URL
    },
    memory: {
      maxSize: parseInt(process.env.MEMORY_MAX_SIZE || '10000')
    }
  };
  const storage = StorageFactory.create(storageType, storageOptions);
  
  // Create context service
  const contextService = new ContextService(storage);
  
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
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR]', new Date().toISOString(), err.stack);
    
    // Don't leak error details in production
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
      success: false,
      error: err.name || 'Internal server error',
      message: isDev ? err.message : 'An error occurred processing your request',
      ...(isDev && { stack: err.stack })
    });
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`Klever MCP HTTP Server running on http://localhost:${port}`);
    console.log(`Storage backend: ${storageType}`);
  });
}

async function startMCPServer() {
  // Create storage backend with proper options
  const storageType = (process.env.STORAGE_TYPE as StorageType) || 'memory';
  const storageOptions: StorageOptions = {
    redis: {
      url: process.env.REDIS_URL
    },
    memory: {
      maxSize: parseInt(process.env.MEMORY_MAX_SIZE || '10000')
    }
  };
  const storage = StorageFactory.create(storageType, storageOptions);
  
  // Create context service
  const contextService = new ContextService(storage);
  
  // Auto-ingest knowledge if using memory storage
  if (storageType === 'memory') {
    await autoIngestKnowledge(contextService);
  }
  
  // Create and start MCP server
  const mcpServer = new KleverMCPServer(contextService);
  await mcpServer.start();
}

// Determine which mode to run
const mode = process.env.MODE || 'http';

if (mode === 'mcp') {
  startMCPServer().catch(console.error);
} else {
  startHTTPServer().catch(console.error);
}