// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

interface DependencyRow {
  contributionPercentageRunningTotal: number;
}

interface DependencyGroup {
  count: number;
  contributionPercentage: number;
}

// The pipes sum two-decimal shares in Float64, which leaves noise such as 51.370000000000005.
export const toTwoDecimals = (value: number) => Math.round(value * 100) / 100;

export function toGroups<T extends DependencyRow>(
  rows: T[],
  totalCount: (row: T) => number,
): { top: DependencyGroup; other: DependencyGroup } {
  if (rows.length === 0) {
    return {
      top: { count: 0, contributionPercentage: 0 },
      other: { count: 0, contributionPercentage: 0 },
    };
  }
  // The pipes' outer query has no ORDER BY, so the share is the largest running total rather than
  // the last row's.
  const topShare = toTwoDecimals(
    Math.max(...rows.map((row) => row.contributionPercentageRunningTotal)),
  );
  return {
    top: { count: rows.length, contributionPercentage: topShare },
    // Every row carries the same total.
    other: {
      count: Math.max(0, totalCount(rows[0]) - rows.length),
      contributionPercentage: toTwoDecimals(100 - topShare),
    },
  };
}
