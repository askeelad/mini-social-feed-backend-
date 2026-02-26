import { userRepository } from '../users/user.repository';
import { SignupInput, LoginInput, RefreshTokenInput, FcmTokenInput } from './auth.schema';
import { AppError } from '../../utils/app-error.util';
import { ERROR_MESSAGES, HTTP_STATUS, REDIS_KEYS } from '../../constants';
import { hashPassword, comparePassword } from '../../utils/hash.util';
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  TokenPayload,
} from '../../utils/jwt.util';
import { getRedisClient } from '../../config/redis.config';
import jwt from 'jsonwebtoken';
import { User } from '../users/user.entity';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type UserResponse = Omit<User, 'password_hash'>;

export const signup = async (
  data: SignupInput,
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  const existingEmail = await userRepository.findByEmail(data.email);
  if (existingEmail) {
    throw new AppError(ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
  }

  const existingUsername = await userRepository.findByUsername(data.username);
  if (existingUsername) {
    throw new AppError(ERROR_MESSAGES.AUTH.USERNAME_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    username: data.username,
    email: data.email,
    password_hash: hashedPassword,
  });

  const tokenPayload: TokenPayload = { id: user.id, email: user.email, username: user.username };
  const accessToken = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);

  const redisClient = getRedisClient();
  await redisClient.setEx(
    REDIS_KEYS.USER_REFRESH_TOKEN(user.id),
    7 * 24 * 60 * 60, // 7 days
    refreshToken,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, tokens: { accessToken, refreshToken } };
};

export const login = async (
  data: LoginInput,
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  const isPasswordValid = await comparePassword(data.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  const tokenPayload: TokenPayload = { id: user.id, email: user.email, username: user.username };
  const accessToken = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);

  const redisClient = getRedisClient();
  await redisClient.setEx(REDIS_KEYS.USER_REFRESH_TOKEN(user.id), 7 * 24 * 60 * 60, refreshToken);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, tokens: { accessToken, refreshToken } };
};

export const refresh = async (data: RefreshTokenInput): Promise<{ accessToken: string }> => {
  try {
    const decoded = verifyToken(data.refreshToken, process.env.JWT_REFRESH_SECRET!);

    const redisClient = getRedisClient();
    const storedToken = await redisClient.get(REDIS_KEYS.USER_REFRESH_TOKEN(decoded.id));

    if (storedToken !== data.refreshToken) {
      throw new Error('Token mismatch');
    }

    const tokenPayload: TokenPayload = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };
    const accessToken = createAccessToken(tokenPayload);

    return { accessToken };
  } catch (error) {
    throw new AppError(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
  }
};

export const logout = async (userId: string, authHeader?: string): Promise<void> => {
  const redisClient = getRedisClient();

  await redisClient.del(REDIS_KEYS.USER_REFRESH_TOKEN(userId));

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7);
    try {
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await redisClient.setEx(REDIS_KEYS.BLACKLISTED_TOKEN(accessToken), expiresIn, 'revoked');
        }
      }
    } catch {
      // Ignore if parsing fails
    }
  }
};

export const updateFcmToken = async (userId: string, data: FcmTokenInput): Promise<void> => {
  await userRepository.updateFcmToken(userId, data.fcmToken);
};
