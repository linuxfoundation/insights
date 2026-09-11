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

  it('leaves the total undefined when the field is missing and the page is exactly full', () => {
    expect(paginationTotal({ rows: 20 }, 0, 20)).toBeUndefined();
    expect(paginationTotal({ rows: 20 }, 3, 20)).toBeUndefined();
  });

  it('reports 0 for a genuinely empty result set on the first page', () => {
    expect(paginationTotal({ rows: 0 }, 0, 20)).toBe(0);
  });

  it('leaves the total undefined for an out-of-range page rather than reporting page * pageSize', () => {
    // A request for page 3 of a 47-row result (pageSize 20) legitimately returns 0 rows;
    // page * pageSize would wrongly report 60 instead of leaving the true total unknown.
    expect(paginationTotal({ rows: 0 }, 3, 20)).toBeUndefined();
  });
});
