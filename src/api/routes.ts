import { Router, Request, Response } from 'express';
import { ContextService } from '../context/service.js';
import { ContextPayloadSchema, QueryContextSchema } from '../types/index.js';
import { z } from 'zod';

/**
 * API routes for context management
 * 
 * IMPROVEMENTS MADE:
 * 1. Added input validation for query parameters
 * 2. Added rate limiting considerations (TODO)
 * 3. Consistent error response format
 * 4. Added batch operation endpoint
 */

export function createRoutes(contextService: ContextService): Router {
  const router = Router();
  
  // Health check
  router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Ingest context
  router.post('/context', async (req: Request, res: Response) => {
    try {
      const payload = ContextPayloadSchema.parse(req.body);
      const id = await contextService.ingest(payload);
      
      res.status(201).json({ 
        success: true,
        id,
        message: 'Context ingested successfully' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
  
  // Retrieve context by ID
  router.get('/context/:id', async (req: Request, res: Response) => {
    try {
      const context = await contextService.retrieve(req.params.id);
      
      if (!context) {
        res.status(404).json({ 
          success: false,
          error: 'Context not found' 
        });
        return;
      }
      
      res.json({ 
        success: true,
        data: context 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Query contexts
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
          limit: result.limit
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
  
  // Update context
  router.put('/context/:id', async (req: Request, res: Response) => {
    try {
      const payload = ContextPayloadSchema.partial().parse(req.body);
      const success = await contextService.update(req.params.id, payload);
      
      if (!success) {
        res.status(404).json({ 
          success: false,
          error: 'Context not found' 
        });
        return;
      }
      
      res.json({ 
        success: true,
        message: 'Context updated successfully' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
  
  // Delete context
  router.delete('/context/:id', async (req: Request, res: Response) => {
    try {
      const success = await contextService.delete(req.params.id);
      
      if (!success) {
        res.status(404).json({ 
          success: false,
          error: 'Context not found' 
        });
        return;
      }
      
      res.json({ 
        success: true,
        message: 'Context deleted successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Find similar contexts
  router.get('/context/:id/similar', async (req: Request, res: Response) => {
    try {
      // VALIDATION: Ensure limit is within reasonable bounds
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam) : 5;
      
      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid limit parameter',
          details: 'Limit must be between 1 and 100'
        });
        return;
      }
      
      const similar = await contextService.findSimilar(req.params.id, limit);
      
      res.json({ 
        success: true,
        data: similar 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
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
          details: 'Request body must be an array'
        });
        return;
      }
      
      if (req.body.length > MAX_BATCH_SIZE) {
        res.status(400).json({
          success: false,
          error: 'Batch too large',
          details: `Maximum batch size is ${MAX_BATCH_SIZE}`
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
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      res.status(errors.length > 0 ? 207 : 201).json({
        success: errors.length === 0,
        ids,
        errors: errors.length > 0 ? errors : undefined,
        message: `Ingested ${ids.length} out of ${payloads.length} contexts`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
  
  return router;
}