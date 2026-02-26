import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Post content cannot be empty')
      .max(500, 'Post content must not exceed 500 characters'),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Post content cannot be empty')
      .max(500, 'Post content must not exceed 500 characters'),
  }),
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    username: z.string().optional(),
  }),
});

export const searchPostsQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query cannot be empty'),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
