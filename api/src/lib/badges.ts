// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { type Static } from '@sinclair/typebox';

import { dataEnum, enumGuard, isCount } from './security.js';

// The leaderboards pipe holds more types; these are the ones the Overview tab turns into badges.
export const LeaderboardType = dataEnum(
  [
    'active-contributors',
    'active-organizations',
    'codebase-size',
    'commit-activity',
    'fastest-mergers',
    'fastest-responders',
    'forks',
    'package-downloads',
    'stars',
  ] as const,
  'Leaderboard the badge comes from.',
);

export const BadgeTier = dataEnum(
  ['black', 'gold', 'silver', 'bronze'] as const,
  'Badge tier by percentile: `black` at 1 or less, `gold` up to 10, `silver` up to 25 and `bronze` up to 50.',
);

type Tier = Static<typeof BadgeTier>;
const tierCaps: [Tier, number][] = [
  ['black', 1],
  ['gold', 10],
  ['silver', 25],
  ['bronze', 50],
];

export interface LeaderboardRow {
  leaderboardType: string;
  rank: number;
  totalCount: number;
}

export const isLeaderboardRow = (row: LeaderboardRow) =>
  typeof row === 'object' &&
  row !== null &&
  typeof row.leaderboardType === 'string' &&
  isCount(row.rank) &&
  row.rank >= 1 &&
  isCount(row.totalCount);

const isBadgeType = enumGuard(LeaderboardType);

// The tier comes from the unrounded share and the percentile is rounded up, as the Overview tab does.
export function toBadge(row: LeaderboardRow) {
  if (!isBadgeType(row.leaderboardType) || row.totalCount === 0) {
    return null;
  }
  // Multiplying first keeps exact shares exact: 7 / 100 * 100 is 7.000000000000001, which rounds up to 8.
  const share = (row.rank * 100) / row.totalCount;
  const tier = tierCaps.find(([, cap]) => share <= cap)?.[0];
  return tier
    ? {
        leaderboardType: row.leaderboardType as Static<typeof LeaderboardType>,
        tier,
        rank: row.rank,
        totalCount: row.totalCount,
        percentile: Math.ceil(share),
      }
    : null;
}

type Badge = NonNullable<ReturnType<typeof toBadge>>;
const tierOrder = (badge: Badge) => BadgeTier.enum.indexOf(badge.tier);
const typeOrder = (badge: Badge) => LeaderboardType.enum.indexOf(badge.leaderboardType);

export const badgeOrder = (a: Badge, b: Badge) =>
  tierOrder(a) - tierOrder(b) || a.percentile - b.percentile || typeOrder(a) - typeOrder(b);
