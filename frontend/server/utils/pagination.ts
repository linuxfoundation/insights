// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

interface RowCountedResponse {
  rows: number;
  rows_before_limit_at_least?: number;
}

/**
 * Total row count for a paginated Tinybird response. rows_before_limit_at_least is
 * occasionally omitted by the pipe; rows alone is only this page's row count, not the
 * grand total, so it's only derivable when it unambiguously proves the true total:
 * - rows === 0 on page 0 means the result set is genuinely empty (total = 0). A later
 *   page returning 0 rows could just be past the end of a smaller result set, so no
 *   total can be inferred there.
 * - 0 < rows < pageSize proves this is the last page with data (total = page * pageSize
 *   + rows), since a non-final page is always full.
 * Any other case (rows === pageSize) is ambiguous - there may be more pages - so the
 * result is left undefined rather than risk understating the total and truncating
 * pagination.
 */
export function paginationTotal(
  response: RowCountedResponse,
  page: number,
  pageSize: number,
): number | undefined {
  if (response.rows_before_limit_at_least !== undefined) {
    return response.rows_before_limit_at_least;
  }
  if (response.rows === 0) {
    return page === 0 ? 0 : undefined;
  }
  return response.rows < pageSize ? page * pageSize + response.rows : undefined;
}
