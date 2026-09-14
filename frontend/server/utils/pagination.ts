// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

interface RowCountedResponse {
  rows: number;
  rows_before_limit_at_least?: number;
}

/**
 * Best-effort total row count for a paginated Tinybird response. rows_before_limit_at_least
 * is occasionally omitted by the pipe; when it is, page * pageSize + rows (everything
 * fetched up to and including this page) is reported instead - exact when this is
 * genuinely the last page, an underestimate otherwise. This value is for display only;
 * callers deciding whether to fetch another page should use paginationHasMore instead
 * of dividing this by pageSize, since an underestimate here would otherwise look like
 * the end of the results.
 */
export function paginationTotal(
  response: RowCountedResponse,
  page: number,
  pageSize: number,
): number {
  if (response.rows_before_limit_at_least !== undefined) {
    return response.rows_before_limit_at_least;
  }
  // Some callers only type-assert page/pageSize from getQuery() rather than converting
  // them, so they can still be strings at runtime - coerce here so the arithmetic below
  // can't silently fall back to string concatenation.
  const pageNum = Number(page);
  const pageSizeNum = Number(pageSize);
  if (pageNum > 0 && response.rows === 0) {
    return 0;
  }
  return pageNum * pageSizeNum + response.rows;
}

/**
 * Whether another page exists, resolved independently of paginationTotal's accuracy.
 * When rows_before_limit_at_least is known, this is exact. Otherwise a page returning
 * as many rows as requested might not be the last one, so true is reported to guarantee
 * the next page is fetched rather than risk stopping early - at worst one extra request
 * comes back empty.
 */
export function paginationHasMore(
  response: RowCountedResponse,
  page: number,
  pageSize: number,
): boolean {
  const pageSizeNum = Number(pageSize);
  if (response.rows_before_limit_at_least !== undefined) {
    return (Number(page) + 1) * pageSizeNum < response.rows_before_limit_at_least;
  }
  return response.rows >= pageSizeNum;
}
