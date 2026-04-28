import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';
import { logger } from '../logger';

/**
 * Garante que todas as queries do usuário autenticado
 * incluam o tenantId correto — proteção chave do multi-tenant.
 */
export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    logger.error('Request autenticado sem tenantId no JWT', {
      path: req.originalUrl,
      userId: req.user?.sub,
    });
    throw new ForbiddenError('Contexto de empresa inválido');
  }

  _res.locals.tenantId = tenantId;
  next();
}
