import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './middlewares/error.middleware';
import { globalRateLimiter } from './middlewares/rate-limit.middleware';
import { sendSuccess, sendError } from './utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from './constants';
import { logger } from './utils/logger.util';
import authRoutes from './modules/auth/auth.routes';
import postRoutes from './modules/posts/post.routes';
import notificationRoutes from './modules/notifications/notification.routes';

const createApp = (): Application => {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );
  app.use(globalRateLimiter);

  // ── Request parsing ────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(compression());

  // ── HTTP logging ───────────────────────────────────────────────────────────
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: () => process.env.NODE_ENV === 'test',
    }),
  );

  // ── Swagger Docs ───────────────────────────────────────────────────────────
  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'Social Feed API Docs',
    }),
  );
  app.get('/api/v1/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ── Health check ───────────────────────────────────────────────────────────
  /**
   * @swagger
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: API health check
   *     security: []
   *     responses:
   *       200:
   *         description: Healthy
   */
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    sendSuccess(res, 'API is healthy', { status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API Routes (modules mounted here as they are built) ────────────────────
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/posts', postRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    sendError(res, ERROR_MESSAGES.GENERAL.ROUTE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  });

  // ── Global error handler (must be last) ────────────────────────────────────
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  return app;
};

export default createApp;
