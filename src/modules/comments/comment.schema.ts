import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Comment cannot be empty')
      .max(300, 'Comment must not exceed 300 characters'),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
