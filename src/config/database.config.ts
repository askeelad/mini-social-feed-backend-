import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { logger } from '../utils/logger.util';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...(process.env.DB_URL
    ? { url: process.env.DB_URL }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'feeduser',
        password: process.env.DB_PASSWORD ?? 'feedpass',
        database: process.env.DB_NAME ?? 'social_feed',
      }),
  entities: [__dirname + '/../modules/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Only in dev — use migrations in prod
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

export const connectDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('PostgreSQL connection established successfully.');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
};
