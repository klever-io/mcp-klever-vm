import { Router, Request, Response } from 'express';
import { ContextService } from '../context/service.js';
import { ContextPayloadSchema, QueryContextSchema } from '../types/index.js';
import { z } from 'zod';
import { getVersionInfo } from '../version.js';

/**
 * API routes for context management
 *
 * IMPROVEMENTS MADE:
 * 1. Added input validation for query parameters
 * 2. Added rate limiting considerations (TODO)
 * 3. Consistent error response format
 * 4. Added batch operation endpoint
 * 5. Added readOnly mode for public deployments
 */

export interface RouteOptions {
  readOnly?: boolean;
}

export function createRoutes(contextService: ContextService, options?: RouteOptions): Router {
  const router = Router();
  const readOnly = options?.readOnly ?? false;

  // Health check (enhanced for public mode)
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const response: Record<string, unknown> = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: readOnly ? 'public' : 'local',
        uptime: process.uptime(),
        ...getVersionInfo(),
      };

      if (readOnly) {
        const allContexts = await contextService.query({ limit: 1, offset: 0 });
        response.knowledgeBase = {
          totalContexts: allContexts.total,
        };
      }

      res.json(response);
    } catch {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        mode: readOnly ? 'public' : 'local',
        uptime: process.uptime(),
        ...getVersionInfo(),
      });
    }
  });

  // Query contexts (available in both modes)
  router.post('/context/query', async (req: Request, res: Response) => {
    try {
      const params = QueryContextSchema.parse(req.body);
      const result = await contextService.query(params);

      res.json({
        success: true,
        data: result.results,
        pagination: {
          total: result.total,
          offset: result.offset,
          limit: result.limit,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  });

  // Retrieve context by ID (available in both modes)
  router.get('/context/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const context = await contextService.retrieve(id);

      if (!context) {
        res.status(404).json({
          success: false,
          error: 'Context not found',
        });
        return;
      }

      res.json({
        success: true,
        data: context,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Find similar contexts (available in both modes)
  router.get('/context/:id/similar', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      // VALIDATION: Ensure limit is within reasonable bounds
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam) : 5;

      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid limit parameter',
          details: 'Limit must be between 1 and 100',
        });
        return;
      }

      const similar = await contextService.findSimilar(id, limit);

      res.json({
        success: true,
        data: similar,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Write endpoints — only available in local mode
  if (!readOnly) {
    // Ingest context
    router.post('/context', async (req: Request, res: Response) => {
      try {
        const payload = ContextPayloadSchema.parse(req.body);
        const id = await contextService.ingest(payload);

        res.status(201).json({
          success: true,
          id,
          message: 'Context ingested successfully',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.errors,
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });

    // Update context
    router.put('/context/:id', async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const payload = ContextPayloadSchema.partial().parse(req.body);
        const success = await contextService.update(id, payload);

        if (!success) {
          res.status(404).json({
            success: false,
            error: 'Context not found',
          });
          return;
        }

        res.json({
          success: true,
          message: 'Context updated successfully',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.errors,
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });

    // Delete context
    router.delete('/context/:id', async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const success = await contextService.delete(id);

        if (!success) {
          res.status(404).json({
            success: false,
            error: 'Context not found',
          });
          return;
        }

        res.json({
          success: true,
          message: 'Context deleted successfully',
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Batch ingest contexts
    router.post('/context/batch', async (req: Request, res: Response) => {
      try {
        // VALIDATION: Limit batch size to prevent DoS
        const MAX_BATCH_SIZE = 100;

        if (!Array.isArray(req.body)) {
          res.status(400).json({
            success: false,
            error: 'Invalid request',
            details: 'Request body must be an array',
          });
          return;
        }

        if (req.body.length > MAX_BATCH_SIZE) {
          res.status(400).json({
            success: false,
            error: 'Batch too large',
            details: `Maximum batch size is ${MAX_BATCH_SIZE}`,
          });
          return;
        }

        const payloads = z.array(ContextPayloadSchema).parse(req.body);
        const ids: string[] = [];
        const errors: any[] = [];

        for (let i = 0; i < payloads.length; i++) {
          try {
            const id = await contextService.ingest(payloads[i]);
            ids.push(id);
          } catch (error) {
            errors.push({
              index: i,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        res.status(errors.length > 0 ? 207 : 201).json({
          success: errors.length === 0,
          ids,
          errors: errors.length > 0 ? errors : undefined,
          message: `Ingested ${ids.length} out of ${payloads.length} contexts`,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.errors,
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });
  }

  return router;
}
