export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    USERNAME_ALREADY_EXISTS: 'This username is already taken.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    TOKEN_INVALID: 'Invalid or malformed token.',
    UNAUTHORIZED: 'You must be logged in to perform this action.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    REFRESH_TOKEN_INVALID: 'Invalid or expired refresh token.',
    FCM_TOKEN_REQUIRED: 'FCM device token is required.',
  },
  POST: {
    NOT_FOUND: 'Post not found.',
    NOT_OWNER: 'You can only modify your own posts.',
    CONTENT_REQUIRED: 'Post content cannot be empty.',
    CONTENT_TOO_LONG: 'Post content must not exceed 500 characters.',
  },
  COMMENT: {
    NOT_FOUND: 'Comment not found.',
    CONTENT_REQUIRED: 'Comment content cannot be empty.',
    CONTENT_TOO_LONG: 'Comment must not exceed 300 characters.',
  },
  USER: {
    NOT_FOUND: 'User not found.',
  },
  GENERAL: {
    INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    VALIDATION_ERROR: 'Validation failed.',
    NOT_FOUND: 'Resource not found.',
    ROUTE_NOT_FOUND: 'The requested route does not exist.',
    TOO_MANY_REQUESTS: 'Too many requests. Please slow down.',
  },
} as const;
