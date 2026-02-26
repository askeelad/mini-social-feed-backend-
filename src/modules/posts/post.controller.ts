import { Response, NextFunction } from 'express';
import * as postService from './post.service';
import { sendSuccess } from '../../utils/response.util';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants';
import { AuthenticatedRequest } from '../../types/request.types';
import { CreatePostInput } from './post.schema';

export const createPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const post = await postService.createPost(req.user.id, req.body as CreatePostInput);
    sendSuccess(res, SUCCESS_MESSAGES.POST.CREATED, post, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, username } = req.query as Record<string, string | undefined>;
    const { posts, meta } = await postService.getFeed(page, limit, username);
    sendSuccess(res, SUCCESS_MESSAGES.POST.FETCHED, posts, HTTP_STATUS.OK, meta);
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q, page, limit } = req.query as Record<string, string | undefined>;
    // 'q' is guaranteed to be a string by zod validation
    const { posts, meta } = await postService.searchPosts(q!, page, limit);
    sendSuccess(res, SUCCESS_MESSAGES.POST.FETCHED, posts, HTTP_STATUS.OK, meta);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const post = await postService.getPostById(req.params.id);
    sendSuccess(res, SUCCESS_MESSAGES.POST.SINGLE_FETCHED, post, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await postService.deletePost(req.params.id, req.user.id);
    sendSuccess(res, SUCCESS_MESSAGES.POST.DELETED, null, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { content } = req.body as { content: string };
    const post = await postService.updatePost(req.params.id, req.user.id, content);
    sendSuccess(res, 'Post updated successfully', post, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};
