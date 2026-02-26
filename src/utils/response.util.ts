import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../constants/http-status.constants';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: unknown;
}

/**
 * Sends a standardised success response.
 * All controllers must use this — no raw res.json() calls.
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: HttpStatusCode = HTTP_STATUS.OK,
  meta?: PaginationMeta,
): Response => {
  const response: ApiResponse<T> = { success: true, message, data, meta };
  return res.status(statusCode).json(response);
};

/**
 * Sends a standardised error response.
 * Primarily used by the global error handler middleware.
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: unknown,
): Response => {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
};
