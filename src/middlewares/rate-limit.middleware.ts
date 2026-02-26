import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, ERROR_MESSAGES.GENERAL.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, ERROR_MESSAGES.GENERAL.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});
