import { Request } from 'express';

/**
 * Augments Express Request to include the authenticated user payload.
 * Populated by the auth middleware after JWT verification.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
