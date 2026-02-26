import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf, json, errors } = format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return stack
    ? `[${ts as string}] ${level}: ${message as string}\n${stack as string}`
    : `[${ts as string}] ${level}: ${message as string}`;
});

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    isDevelopment ? combine(colorize(), devFormat) : json(),
  ),
  transports: [new transports.Console()],
  exitOnError: false,
});
