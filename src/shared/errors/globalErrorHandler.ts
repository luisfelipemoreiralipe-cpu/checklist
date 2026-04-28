import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from './AppError';
import { logger } from '../logger';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    path: string;
  };
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  // Erros de validação do Zod
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    logger.warn('Validation error', { path, issues });

    const body: ErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos na requisição',
        details: issues,
        timestamp,
        path,
      },
    };

    res.status(400).json(body);
    return;
  }

  // Erros operacionais da aplicação
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Application error', { code: err.code, message: err.message, path, stack: err.stack });
    } else {
      logger.warn('Client error', { code: err.code, message: err.message, path });
    }

    const body: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        details: err instanceof ValidationError ? err.details : undefined,
        timestamp,
        path,
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  // Erros inesperados (bugs)
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    path,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      timestamp,
      path,
    },
  });
}
