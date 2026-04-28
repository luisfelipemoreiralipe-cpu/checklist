import { z } from 'zod';

export const startExecutionSchema = z.object({
  checklistId: z.string().min(1, 'ID de checklist é obrigatório'),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']).optional(),
  notes: z.string().optional(),
});

export const answerItemSchema = z.object({
  checklistItemId: z.string().min(1, 'ID de item é obrigatório'),
  value: z.unknown(), // flexível — boolean, number, string
  photoUrl: z.string().url().optional(),
  comment: z.string().optional(),
});

export const finishExecutionSchema = z.object({
  notes: z.string().optional(),
});

export const listExecutionQuerySchema = z.object({
  checklistId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
});

export type StartExecutionDto = z.infer<typeof startExecutionSchema>;
export type AnswerItemDto = z.infer<typeof answerItemSchema>;
export type FinishExecutionDto = z.infer<typeof finishExecutionSchema>;
export type ListExecutionQuery = z.infer<typeof listExecutionQuerySchema>;
