import { Response, NextFunction } from 'express';
import * as commentService from './comment.service';
import { sendSuccess } from '../../utils/response.util';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants';
import { AuthenticatedRequest } from '../../types/request.types';
import { CreateCommentInput } from './comment.schema';

export const addComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const comment = await commentService.addComment(
      req.params.id,
      req.user.id,
      req.body as CreateCommentInput,
    );
    sendSuccess(res, SUCCESS_MESSAGES.COMMENT.CREATED, comment, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string | undefined>;
    const { comments, meta } = await commentService.getComments(req.params.id, page, limit);
    sendSuccess(res, SUCCESS_MESSAGES.COMMENT.FETCHED, comments, HTTP_STATUS.OK, meta);
  } catch (error) {
    next(error);
  }
};
