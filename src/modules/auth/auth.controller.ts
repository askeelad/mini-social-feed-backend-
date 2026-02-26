import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response.util';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants';
import { AuthenticatedRequest } from '../../types/request.types';
import { SignupInput, LoginInput, RefreshTokenInput, FcmTokenInput } from './auth.schema';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.signup(req.body as SignupInput);
    sendSuccess(res, SUCCESS_MESSAGES.AUTH.SIGNUP, result, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body as LoginInput);
    sendSuccess(res, SUCCESS_MESSAGES.AUTH.LOGIN, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.refresh(req.body as RefreshTokenInput);
    sendSuccess(res, SUCCESS_MESSAGES.AUTH.TOKEN_REFRESHED, result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    await authService.logout(req.user.id, authHeader);
    sendSuccess(res, SUCCESS_MESSAGES.AUTH.LOGOUT, null, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

export const updateFcmToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.updateFcmToken(req.user.id, req.body as FcmTokenInput);
    sendSuccess(res, SUCCESS_MESSAGES.AUTH.FCM_TOKEN_UPDATED, null, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};
