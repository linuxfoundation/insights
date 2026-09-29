// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static } from '@sinclair/typebox';

import { nullableEnum, nullableString } from '../schemas/common.js';
import { dataEnum, enumGuard, isCount, isString } from './security.js';

export const LeaderboardType = dataEnum(
  [
    'contributors',
    'organizations',
    'active-contributors',
    'active-organizations',
    'commit-activity',
    'stars',
    'forks',
    'package-downloads',
    'codebase-size',
    'fastest-responders',
    'fastest-mergers',
    'focused-teams',
    'resolution-rate',
    'small-teams-massive-output',
  ] as const,
  'Leaderboard the entry ranks on.',
);

export const LeaderboardStatus = nullableEnum(
  ['active', 'archived', 'formation'] as const,
  'Project lifecycle status. Null on the contributors and organizations leaderboards.',
);

const EntityType = dataEnum(
  ['project', 'contributor', 'organization'] as const,
  'Kind of entity ranked: a project, a contributor or an organization.',
);
const MetricUnit = dataEnum(
  ['count', 'seconds', 'ratio', 'lines'] as const,
  'Unit of `value` and `previousPeriodValue` on this leaderboard.',
);

interface LeaderboardTypeCatalogEntry {
  type: Static<typeof LeaderboardType>;
  name: string;
  description: string;
  entityType: Static<typeof EntityType>;
  metricLabel: string;
  metricUnit: Static<typeof MetricUnit>;
  eligibility: string | null;
}

export const leaderboardTypes: LeaderboardTypeCatalogEntry[] = [
  {
    type: 'contributors',
    name: 'Top 100 contributors',
    description:
      'Developers ranked by volume of contributions over the last 12 months, highlighting the most active and influential individuals.',
    entityType: 'contributor',
    metricLabel: 'Contributions (12M)',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'organizations',
    name: 'Top 100 organizations',
    description:
      'Most influential organizations based on the total number of contributions made over the last 12 months.',
    entityType: 'organization',
    metricLabel: 'Contributions (12M)',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'active-contributors',
    name: 'Most active contributors',
    description:
      'These projects attracted the highest number of unique contributors over the past 12 months.',
    entityType: 'project',
    metricLabel: 'Contributors (12M)',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'active-organizations',
    name: 'Most active organizations',
    description:
      'These projects brought together the largest number of distinct contributing organizations in the past 12 months.',
    entityType: 'project',
    metricLabel: 'Organizations (12M)',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'commit-activity',
    name: 'Commit activity',
    description:
      'These projects recorded the most commits during the past 12 months, showing high development momentum.',
    entityType: 'project',
    metricLabel: 'Commits (12M)',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'stars',
    name: 'Stars',
    description:
      'Projects ranked by number of stars, reflecting overall popularity and community interest.',
    entityType: 'project',
    metricLabel: 'Stars',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'forks',
    name: 'Forks',
    description:
      'Projects ranked by number of fork activities, highlighting reuse and extensibility by developers.',
    entityType: 'project',
    metricLabel: 'Forks',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'package-downloads',
    name: 'Package downloads',
    description:
      'Projects ranked by package downloads in the last month, showcasing tools with strong real-world adoption by the developer community.',
    entityType: 'project',
    metricLabel: 'Package downloads (30D)',
    metricUnit: 'count',
    eligibility: null,
  },
  {
    type: 'codebase-size',
    name: 'Codebase size',
    description:
      'These projects maintain the largest codebases measured by total source lines of code.',
    entityType: 'project',
    metricLabel: 'Lines of code',
    metricUnit: 'lines',
    eligibility: null,
  },
  {
    type: 'fastest-responders',
    name: 'Fastest responders',
    description:
      'These projects achieve the shortest median time to first response on issues over the past 12 months.',
    entityType: 'project',
    metricLabel: 'Median time to 1st response (12M)',
    metricUnit: 'seconds',
    eligibility: null,
  },
  {
    type: 'fastest-mergers',
    name: 'Fastest mergers',
    description: 'These projects merge pull requests the fastest over the past 12 months.',
    entityType: 'project',
    metricLabel: 'Median time to merge (12M)',
    metricUnit: 'seconds',
    eligibility: null,
  },
  {
    type: 'focused-teams',
    name: 'Most focused teams',
    description: 'These projects show the highest productivity per contributor.',
    entityType: 'project',
    metricLabel: 'Avg. commits per author',
    metricUnit: 'count',
    eligibility: 'Projects with 10 or more authors.',
  },
  {
    type: 'resolution-rate',
    name: 'Highest resolution rate',
    description:
      'These projects keep development flowing, with most pull requests merged relative to issues opened.',
    entityType: 'project',
    metricLabel: 'PR/Issue ratio',
    metricUnit: 'ratio',
    eligibility: null,
  },
  {
    type: 'small-teams-massive-output',
    name: 'Small teams, massive output',
    description:
      'These projects demonstrate exceptional productivity, achieving the highest commit volumes with 50 or fewer contributors.',
    entityType: 'project',
    metricLabel: 'Commits',
    metricUnit: 'count',
    eligibility: 'Projects with 50 or fewer contributors.',
  },
];

export const LeaderboardTypeInfo = Type.Object(
  {
    type: LeaderboardType,
    name: Type.String({ description: 'Display name of the leaderboard.' }),
    description: Type.String({ description: 'What the leaderboard ranks and over what period.' }),
    entityType: EntityType,
    metricLabel: Type.String({ description: 'Label for the ranking metric, as shown in the UI.' }),
    metricUnit: MetricUnit,
    eligibility: nullableString(
      'Restriction on which entities can rank here. Null when every entity is eligible.',
    ),
  },
  { title: 'LeaderboardTypeInfo' },
);
export type LeaderboardTypeInfo = Static<typeof LeaderboardTypeInfo>;

// The columns toEntry keeps. The pipe's collectionsSlugs stays out because it mixes in private
// collection slugs.
export interface LeaderboardRow {
  rank: number;
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  value: number;
  previousPeriodValue: number;
  isLF: 0 | 1;
  githubHandleArray: string[];
  status: string;
  totalCount: number;
}

const statusGuard = enumGuard(LeaderboardStatus);
const isStatus = (value: unknown): value is NonNullable<LeaderboardEntry['status']> =>
  statusGuard(value);

// The pipe wraps `search` in `ILIKE '%' || search || '%'`, where `\`, `%` and `_` are pattern syntax.
export const escapeLike = (text: string) => text.replace(/[\\%_]/g, '\\$&');

export const isEntryRow = (row: unknown): row is LeaderboardRow => {
  if (typeof row !== 'object' || row === null || Array.isArray(row)) {
    return false;
  }
  const candidate = row as Record<string, unknown>;
  return (
    Number.isSafeInteger(candidate.rank) &&
    (candidate.rank as number) >= 1 &&
    isString(candidate.id) &&
    isString(candidate.name) &&
    isString(candidate.slug) &&
    isString(candidate.logoUrl) &&
    Number.isFinite(candidate.value) &&
    Number.isFinite(candidate.previousPeriodValue) &&
    (candidate.isLF === 0 || candidate.isLF === 1) &&
    isString(candidate.status) &&
    (candidate.status === '' || isStatus(candidate.status)) &&
    Array.isArray(candidate.githubHandleArray) &&
    candidate.githubHandleArray.every(isString) &&
    isCount(candidate.totalCount)
  );
};

// isLF and status stay wide so callers can pass plain rows; an off-enum status maps to null.
export const toEntry = (
  row: Omit<LeaderboardRow, 'isLF'> & { isLF: number },
): LeaderboardEntry => ({
  rank: row.rank,
  id: row.id,
  name: row.name,
  slug: row.slug || null,
  logoUrl: row.logoUrl || null,
  value: row.value,
  previousPeriodValue: row.previousPeriodValue,
  isLF: row.isLF === 1,
  status: isStatus(row.status) ? row.status : null,
  githubHandles: row.githubHandleArray,
  totalCount: row.totalCount,
});

export const LeaderboardEntry = Type.Object(
  {
    rank: Type.Integer({ minimum: 1, description: 'Position on the leaderboard, 1-based.' }),
    id: Type.String({ description: 'Identifier of the ranked entity.' }),
    name: Type.String({ description: 'Display name of the ranked entity.' }),
    slug: nullableString('Public page slug. Null for contributors, who have no public page.'),
    logoUrl: nullableString('Logo or avatar URL. Null when the entity has none.'),
    value: Type.Number({
      description:
        "This period's metric, in the unit the type catalog's `metricUnit` gives for this leaderboard's type. Some pipe values overflow, for example fastest-mergers near 1.8e19; treat those as unreliable.",
    }),
    previousPeriodValue: Type.Number({
      description:
        'Same metric for the previous period, in the same unit. Can be negative from the same upstream overflow, and is unreliable there.',
    }),
    isLF: Type.Boolean({
      description:
        'Whether the project is a Linux Foundation project. Always false on the contributors and organizations leaderboards.',
    }),
    status: LeaderboardStatus,
    githubHandles: Type.Array(Type.String(), {
      description: 'GitHub handles of a contributor entry. Empty for other entity types.',
    }),
    totalCount: Type.Integer({
      minimum: 0,
      description: 'Entries ranked on this leaderboard.',
    }),
  },
  { title: 'LeaderboardEntry' },
);
export type LeaderboardEntry = Static<typeof LeaderboardEntry>;
