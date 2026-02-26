import { Response, NextFunction } from 'express';
import * as likeService from './like.service';
import { sendSuccess } from '../../utils/response.util';
import { HTTP_STATUS } from '../../constants';
import { AuthenticatedRequest } from '../../types/request.types';

export const toggleLike = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await likeService.toggleLike(req.params.id, req.user.id);
    sendSuccess(res, result.message, { liked: result.liked }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};
