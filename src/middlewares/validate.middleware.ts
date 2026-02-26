import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS } from '../constants/http-status.constants';

/**
 * Factory middleware to validate Express Request against a given Zod schema.
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body as unknown,
        query: req.query as unknown,
        params: req.params as unknown,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        sendError(res, 'Validation failed.', HTTP_STATUS.UNPROCESSABLE_ENTITY, formattedErrors);
        return;
      }
      next(error);
    }
  };
