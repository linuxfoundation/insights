// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { paginationTotal, paginationHasMore } from './pagination';

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

  it('understates rather than overstates on an exactly-full page with the field missing', () => {
    // 40 is a lower bound (there may be more); it must never exceed the true total.
    expect(paginationTotal({ rows: 20 }, 0, 20)).toBe(20);
    expect(paginationTotal({ rows: 20 }, 1, 20)).toBe(40);
  });

  it('coerces string page/pageSize so arithmetic never falls back to concatenation', () => {
    // getQuery() values are only type-asserted to number by some callers, so they can
    // still be strings at runtime (e.g. page: '1'); '1' + 2 would concatenate to '12'.
    expect(paginationTotal({ rows: 7 }, '2' as unknown as number, 20)).toBe(47);
    expect(paginationTotal({ rows: 20 }, 1, '20' as unknown as number)).toBe(40);
  });

  it('reports 0 rather than fabricating a boundary for an empty out-of-range page', () => {
    // 47 real rows exist; requesting page 3 at pageSize 20 is out of range and returns
    // 0 rows. page * pageSize (60) would overstate the true total, so 0 is reported instead.
    expect(paginationTotal({ rows: 0 }, 3, 20)).toBe(0);
  });
});

describe('paginationHasMore', () => {
  it('is exact when rows_before_limit_at_least is known', () => {
    expect(paginationHasMore({ rows: 20, rows_before_limit_at_least: 40 }, 0, 20)).toBe(true);
    expect(paginationHasMore({ rows: 20, rows_before_limit_at_least: 40 }, 1, 20)).toBe(false);
  });

  it('is false for a short or empty page with the field missing', () => {
    expect(paginationHasMore({ rows: 15 }, 0, 20)).toBe(false);
    expect(paginationHasMore({ rows: 0 }, 3, 20)).toBe(false);
  });

  it('is true for an exactly-full page with the field missing, to guarantee the next page is fetched', () => {
    expect(paginationHasMore({ rows: 20 }, 0, 20)).toBe(true);
  });

  it('coerces string page/pageSize inputs', () => {
    expect(
      paginationHasMore({ rows: 20 }, '0' as unknown as number, '20' as unknown as number),
    ).toBe(true);
  });
});
