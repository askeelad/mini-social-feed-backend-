export const SUCCESS_MESSAGES = {
  AUTH: {
    SIGNUP: 'Account created successfully.',
    LOGIN: 'Logged in successfully.',
    LOGOUT: 'Logged out successfully.',
    TOKEN_REFRESHED: 'Access token refreshed successfully.',
    FCM_TOKEN_UPDATED: 'FCM token updated successfully.',
  },
  POST: {
    CREATED: 'Post created successfully.',
    FETCHED: 'Posts fetched successfully.',
    DELETED: 'Post deleted successfully.',
    SINGLE_FETCHED: 'Post fetched successfully.',
  },
  LIKE: {
    LIKED: 'Post liked successfully.',
    UNLIKED: 'Post unliked successfully.',
  },
  COMMENT: {
    CREATED: 'Comment added successfully.',
    FETCHED: 'Comments fetched successfully.',
  },
} as const;
