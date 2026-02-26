import { createClient, RedisClientType } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { logger } from '../utils/logger.util';

// Create a common interface so the app doesn't care which Redis is used
export interface IRedisClient {
  get(key: string): Promise<string | null>;
  setEx(key: string, seconds: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
  quit(): Promise<void>;
}

let redisClient: IRedisClient | null = null;
let rawTcpClient: RedisClientType | null = null; // Stored just for quitting

export const getRedisClient = (): IRedisClient => {
  if (!redisClient) {
    throw new Error('Redis client not initialised. Call connectRedis() first.');
  }
  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    // 1. Check if Upstash REST credentials are provided
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const upstash = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      redisClient = {
        get: async (key: string) => (await upstash.get<string>(key)) ?? null,
        setEx: async (key: string, seconds: number, value: string) => {
          await upstash.setex(key, seconds, value);
        },
        del: async (key: string) => {
          await upstash.del(key);
        },
        quit: () => {
          // Upstash is stateless HTTP, no TCP connection to close
          logger.info('Upstash Redis stateless client closed.');
          return Promise.resolve();
        },
      };

      logger.info('Upstash Redis HTTP connection established.');
      return;
    }

    // 2. Fall back to standard TCP Redis connection
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
      url: process.env.REDIS_URL, // Also support standard REDIS_URL if provided
    }) as RedisClientType;

    client.on('error', (err: Error) => logger.error('Redis client error:', err));
    client.on('ready', () => logger.info('Redis connection established.'));
    client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

    await client.connect();

    rawTcpClient = client;
    redisClient = {
      get: async (key: string) => await rawTcpClient!.get(key),
      setEx: async (key: string, seconds: number, value: string) => {
        await rawTcpClient!.setEx(key, seconds, value);
      },
      del: async (key: string) => {
        await rawTcpClient!.del(key);
      },
      quit: async () => {
        await rawTcpClient!.quit();
      },
    };
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
