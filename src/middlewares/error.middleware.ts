import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.util';
import { sendError } from '../utils/response.util';
import { logger } from '../utils/logger.util';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { HTTP_STATUS } from '../constants/http-status.constants';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Global error handling middleware. Must be registered LAST in app.ts.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(err.message, { stack: err.stack });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof TokenExpiredError) {
    sendError(res, ERROR_MESSAGES.AUTH.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    sendError(res, ERROR_MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? ERROR_MESSAGES.GENERAL.INTERNAL_SERVER_ERROR
      : err.message;

  sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
