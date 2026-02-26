import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

export interface DecodedToken extends JwtPayload, TokenPayload {}

/**
 * Signs a JWT token with the given payload and options.
 */
export const signToken = (
  payload: TokenPayload,
  secret: string,
  options: SignOptions = {},
): string => {
  return jwt.sign(payload, secret, options);
};

/**
 * Verifies and decodes a JWT token. Throws if invalid or expired.
 */
export const verifyToken = (token: string, secret: string): DecodedToken => {
  return jwt.verify(token, secret) as DecodedToken;
};

/**
 * Creates a signed access token (short-lived).
 */
export const createAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined in environment.');
  return signToken(payload, secret, { expiresIn } as SignOptions);
};

/**
 * Creates a signed refresh token (long-lived).
 */
export const createRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined in environment.');
  return signToken(payload, secret, { expiresIn } as SignOptions);
};

/**
 * Extracts the JWT from the Authorization: Bearer <token> header.
 */
export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
};
