export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

export const POST = {
  MAX_CONTENT_LENGTH: 500,
} as const;

export const COMMENT = {
  MAX_CONTENT_LENGTH: 300,
} as const;

export const JWT = {
  BEARER_PREFIX: 'Bearer ',
} as const;

export const REDIS_KEYS = {
  BLACKLISTED_TOKEN: (token: string): string => `blacklist:${token}`,
  USER_REFRESH_TOKEN: (userId: string): string => `refresh:${userId}`,
} as const;

export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
