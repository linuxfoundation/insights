// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

interface RowCountedResponse {
  rows: number;
  rows_before_limit_at_least?: number;
}

/**
 * Total row count for a paginated Tinybird response. rows_before_limit_at_least is
 * occasionally omitted by the pipe; rows alone is only this page's row count, not the
 * grand total, so a value is derived without ever understating the true total (which
 * would make a caller computing Math.ceil(total / pageSize) stop before the real end):
 * - rows === 0 means nothing exists at or past this offset, so page * pageSize (the
 *   count of everything before it) is the exact total - 0 on page 0 for a genuinely
 *   empty result set.
 * - 0 < rows < pageSize proves this is the last page with data (total = page * pageSize
 *   + rows), since a non-final page is always full.
 * - rows === pageSize is ambiguous - there may be more pages - so (page + 2) * pageSize
 *   is reported: enough to guarantee at least one more page is fetched. That next
 *   response resolves the real total via one of the cases above.
 */
export function paginationTotal(
  response: RowCountedResponse,
  page: number,
  pageSize: number,
): number {
  if (response.rows_before_limit_at_least !== undefined) {
    return response.rows_before_limit_at_least;
  }
  if (response.rows === 0) {
    return page * pageSize;
  }
  return response.rows < pageSize ? page * pageSize + response.rows : (page + 2) * pageSize;
}
