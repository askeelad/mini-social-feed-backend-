import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger.util';

let redisClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialised. Call connectRedis() first.');
  }
  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    }) as RedisClientType;

    client.on('error', (err: Error) => logger.error('Redis client error:', err));
    client.on('ready', () => logger.info('Redis connection established.'));
    client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

    await client.connect();
    redisClient = client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed.');
  }
};
