import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Target = 'body' | 'query' | 'params';

/**
 * Middleware de validação com Zod.
 * Lança ZodError que será capturado pelo globalErrorHandler.
 */
export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // parse() lança ZodError automaticamente se inválido
    const validated = schema.parse(req[target]);
    
    // Express 5 prevents redefining req.query via simple assignment.
    Object.defineProperty(req, target, {
      value: validated,
      writable: true,
      configurable: true,
      enumerable: true
    });
    
    next();
  };
}
