import 'reflect-metadata';
import 'dotenv/config';

import createApp from './app';
import { connectDatabase } from './config/database.config';
import { connectRedis, disconnectRedis } from './config/redis.config';
import { initializeFirebase } from './utils/fcm.util';
import { logger } from './utils/logger.util';

const PORT = Number(process.env.PORT ?? 3000);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await connectRedis();
    initializeFirebase();

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV ?? 'development'} mode`,
      );
      logger.info(`Swagger docs: http://localhost:${PORT}/api/v1/docs`);
    });

    const shutdown = (signal: string): void => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        void (async (): Promise<void> => {
          try {
            await disconnectRedis();
            logger.info('Server closed.');
            process.exit(0);
          } catch (error) {
            logger.error('Error disconnecting Redis:', error);
            process.exit(1);
          }
        })();
      });
    };

    process.on('SIGTERM', () => {
      shutdown('SIGTERM');
    });
    process.on('SIGINT', () => {
      shutdown('SIGINT');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
      process.exit(1);
    });
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
