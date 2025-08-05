import { z } from 'zod';

export const ContextTypeSchema = z.enum([
  'code_example',
  'best_practice',
  'security_tip',
  'optimization',
  'documentation',
  'error_pattern',
  'deployment_tool',
  'runtime_behavior',
]);

export type ContextType = z.infer<typeof ContextTypeSchema>;

export const ContextMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().default('rust'),
  contractType: z.string().optional(),
  author: z.string().optional(),
  createdAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  updatedAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  relevanceScore: z.number().min(0).max(1).default(0.5),
});

export type ContextMetadata = z.infer<typeof ContextMetadataSchema>;

export const ContextPayloadSchema = z.object({
  id: z.string().optional(),
  type: ContextTypeSchema,
  content: z.string(),
  metadata: ContextMetadataSchema,
  relatedContextIds: z.array(z.string()).default([]),
});

export type ContextPayload = z.infer<typeof ContextPayloadSchema>;

export const QueryContextSchema = z.object({
  query: z.string().optional(),
  types: z.array(ContextTypeSchema).optional(),
  tags: z.array(z.string()).optional(),
  contractType: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
});

export type QueryContext = z.infer<typeof QueryContextSchema>;

export interface StorageBackend {
  store(payload: ContextPayload): Promise<string>;
  retrieve(id: string): Promise<ContextPayload | null>;
  query(params: QueryContext): Promise<ContextPayload[]>;
  update(id: string, payload: Partial<ContextPayload>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  count(params?: Partial<QueryContext>): Promise<number>;
}
