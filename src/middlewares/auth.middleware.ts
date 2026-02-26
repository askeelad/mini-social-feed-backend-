import { Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis.config';
import { REDIS_KEYS, ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { verifyToken, extractBearerToken } from '../utils/jwt.util';
import { AppError } from '../utils/app-error.util';
import { AuthenticatedRequest } from '../types/request.types';

/**
 * Middleware to protect routes that require authentication.
 * Verifies JWT access token and checks it against the Redis blacklist.
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError(ERROR_MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if token is blacklisted (user logged out)
    const redisClient = getRedisClient();
    const isBlacklisted = await redisClient.get(REDIS_KEYS.BLACKLISTED_TOKEN(token));
    if (isBlacklisted) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Verify and decode token
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET!);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(ERROR_MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED));
    }
  }
};
