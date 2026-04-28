import { z } from 'zod';

// ── Checklist Template ────────────────────────────────────────
export const createChecklistSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').trim(),
  description: z.string().optional(),
  category: z.enum([
    'KITCHEN', 'STORAGE', 'CLEANING', 'SAFETY',
    'SERVICE', 'OPENING', 'CLOSING', 'GENERAL',
  ]),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT', 'ON_DEMAND']),
});

export const updateChecklistSchema = z.object({
  name: z.string().min(3).trim().optional(),
  description: z.string().optional(),
  category: z.enum([
    'KITCHEN', 'STORAGE', 'CLEANING', 'SAFETY',
    'SERVICE', 'OPENING', 'CLOSING', 'GENERAL',
  ]).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT', 'ON_DEMAND']).optional(),
  active: z.boolean().optional(),
});

export const listChecklistQuerySchema = z.object({
  category: z.enum([
    'KITCHEN', 'STORAGE', 'CLEANING', 'SAFETY',
    'SERVICE', 'OPENING', 'CLOSING', 'GENERAL',
  ]).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT', 'ON_DEMAND']).optional(),
  active: z.string().transform((v) => v === 'true').optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
});

// ── Checklist Item ────────────────────────────────────────────
export const createItemSchema = z.object({
  title: z.string().min(3).trim(),
  description: z.string().optional(),
  type: z.enum(['BOOLEAN', 'NUMBER', 'TEXT', 'PHOTO', 'RATING']),
  required: z.boolean().default(true),
  weight: z.number().int().min(1).max(10).default(1),
  isCritical: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const updateItemSchema = createItemSchema.partial();

// ── Item Rule ─────────────────────────────────────────────────
export const createRuleSchema = z.object({
  conditionType: z.enum([
    'EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN',
    'GREATER_OR_EQUAL', 'LESS_OR_EQUAL', 'CONTAINS',
  ]),
  conditionValue: z.string().min(1),
  actionType: z.enum([
    'REQUIRE_PHOTO', 'REQUIRE_COMMENT', 'GENERATE_ALERT',
    'BLOCK_COMPLETION', 'NOTIFY_MANAGER',
  ]),
  actionPayload: z.record(z.string(), z.unknown()).optional(),
});

export type CreateChecklistDto = z.infer<typeof createChecklistSchema>;
export type UpdateChecklistDto = z.infer<typeof updateChecklistSchema>;
export type ListChecklistQuery = z.infer<typeof listChecklistQuerySchema>;
export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type CreateRuleDto = z.infer<typeof createRuleSchema>;
