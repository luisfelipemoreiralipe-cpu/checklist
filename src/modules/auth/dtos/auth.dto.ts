import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  // ADMIN não pode ser criado via API — apenas via signup inicial
  role: z.enum(['MANAGER', 'STAFF']).optional().default('STAFF'),
});

export const signUpSchema = z.object({
  companyName: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres').trim(),
  slug: z.string().min(3, 'O slug deve ter no mínimo 3 caracteres').toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug inválido: use apenas letras minúsculas, números e hífens'),
  adminName: z.string().min(2, 'Seu nome deve ter no mínimo 2 caracteres').trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type SignUpDto = z.infer<typeof signUpSchema>;
