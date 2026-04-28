import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

export interface JwtPayload {
  sub: string;       // userId
  tenantId: string;
  role: UserRole;
  email: string;
}

// Estende o tipo Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

// ── Autenticação ─────────────────────────────────────────────
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autenticação não fornecido');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

// ── Autorização por role ──────────────────────────────────────
const roleHierarchy: Record<UserRole, number> = {
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
};

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { role } = req.user;

    const userLevel = roleHierarchy[role];
    const minRequired = Math.min(...allowedRoles.map((r) => roleHierarchy[r]));

    if (userLevel < minRequired) {
      throw new ForbiddenError(
        `Acesso negado. Requer papel: ${allowedRoles.join(' ou ')}`,
      );
    }

    next();
  };
}

// ── Helpers ───────────────────────────────────────────────────
export function isManager(role: UserRole): boolean {
  return roleHierarchy[role] >= roleHierarchy.MANAGER;
}

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}
