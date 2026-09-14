// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { paginationTotal } from './pagination';

describe('paginationTotal', () => {
  it('uses rows_before_limit_at_least when present, even when it is 0', () => {
    expect(paginationTotal({ rows: 20, rows_before_limit_at_least: 137 }, 0, 20)).toBe(137);
    expect(paginationTotal({ rows: 0, rows_before_limit_at_least: 0 }, 0, 20)).toBe(0);
  });

  it('derives an exact total from page * pageSize + rows on a short last page', () => {
    expect(paginationTotal({ rows: 15 }, 0, 20)).toBe(15);
    expect(paginationTotal({ rows: 7 }, 2, 20)).toBe(47);
  });

  it('reports 0 for a genuinely empty result set on the first page', () => {
    expect(paginationTotal({ rows: 0 }, 0, 20)).toBe(0);
  });

  it('treats a later zero-row page as the exact end (page * pageSize)', () => {
    expect(paginationTotal({ rows: 0 }, 3, 20)).toBe(60);
  });

  it('on an exactly-full page with the field missing, reports a total that guarantees the caller fetches at least one more page', () => {
    // Callers derive nextPage from Math.ceil(total / pageSize); the value returned here
    // must make that exceed the page already fetched, or pagination would stop early.
    for (const [page, pageSize] of [
      [0, 20],
      [3, 20],
      [5, 50],
    ] as const) {
      const total = paginationTotal({ rows: pageSize }, page, pageSize);
      const totalPages = Math.ceil(total / pageSize);
      expect(page + 1).toBeLessThan(totalPages);
    }
  });

  it('coerces string page/pageSize so arithmetic never falls back to concatenation', () => {
    // getQuery() values are only type-asserted to number by some callers, so they can
    // still be strings at runtime (e.g. page: '1'); '1' + 2 would concatenate to '12'.
    expect(paginationTotal({ rows: 20 }, '1' as unknown as number, 20)).toBe(60);
    expect(paginationTotal({ rows: 20 }, 1, '20' as unknown as number)).toBe(60);
    expect(paginationTotal({ rows: 7 }, '2' as unknown as number, 20)).toBe(47);
  });
});
