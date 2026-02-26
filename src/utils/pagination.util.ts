import { PAGINATION } from '../constants/app.constants';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  totalPages: number;
  total: number;
}

/**
 * Normalises and validates pagination query params.
 * Returns safe page/limit/skip values for use in DB queries.
 */
export const parsePagination = (
  rawPage?: string | number,
  rawLimit?: string | number,
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, Number(rawPage) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, Number(rawLimit) || PAGINATION.DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds the pagination meta object for the API response.
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): { page: number; limit: number; total: number; totalPages: number } => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
