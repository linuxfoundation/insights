// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static, type TSchema } from '@sinclair/typebox';

import { nullableEnum, nullableNumber, nullableString } from '../schemas/common.js';
import { LeaderboardType } from './leaderboards.js';
import { HealthLabel, ImpactLabel, LifecycleLabel } from './overview.js';
import { dataEnum, enumGuard, isCount, isString } from './security.js';

// OpenAPI 3.0 has no type 'null', so a nullable object carries `nullable` like the scalars in schemas/common.ts.
const nullableObject = <T extends TSchema>(schema: T, description: string) =>
  Type.Unsafe<Static<T> | null>({ ...schema, nullable: true, description });

export const CollectionType = dataEnum(
  ['curated', 'community'] as const,
  '`curated` collections are maintained by the Linux Foundation; `community` collections are created by Insights users.',
);

const FeaturedProject = Type.Object({
  name: Type.String({ description: 'Display name of the project.' }),
  slug: Type.String({
    description: 'Project slug, as used in `GET /v1-alpha/projects/{slug}`.',
  }),
  logoUrl: nullableString('URL of the project logo. Null when it has none.'),
});

export const Collection = Type.Object(
  {
    id: Type.String({ format: 'uuid', description: 'Identifier of the collection.' }),
    name: Type.String({ description: 'Display name of the collection.' }),
    slug: Type.String({ description: 'Collection slug, as used in the request path.' }),
    description: nullableString('Description of the collection. Null when it has none.'),
    type: CollectionType,
    projectCount: Type.Integer({ minimum: 0, description: 'Projects in the collection (count).' }),
    repositoryCount: Type.Integer({
      minimum: 0,
      description:
        'Repositories added to the collection on their own, outside its projects (count).',
    }),
    likeCount: Type.Integer({ minimum: 0, description: 'Users who liked the collection (count).' }),
    featuredProjects: Type.Array(FeaturedProject, {
      maxItems: 5,
      description:
        'Up to 5 projects shown on the collection card: the starred ones, or the first by name when none is starred.',
    }),
    owner: nullableObject(
      Type.Object({
        name: Type.String({ description: 'Display name of the user who created the collection.' }),
        logoUrl: nullableString('Avatar URL of the user. Null when they have none.'),
      }),
      'User who created a `community` collection. Null for `curated` collections.',
    ),
    logoUrl: nullableString('URL of the collection logo. Null when it has none.'),
    imageUrl: nullableString(
      'URL of the background image of the collection card. Null when it has none.',
    ),
    color: nullableString(
      'Accent color of the collection card, as a CSS color. Null when it has none.',
    ),
    createdAt: Type.String({
      format: 'date-time',
      description: 'When the collection was created.',
    }),
    updatedAt: Type.String({
      format: 'date-time',
      description: 'When the collection was last changed.',
    }),
  },
  { title: 'Collection' },
);
export type Collection = Static<typeof Collection>;

// The columns the shared collections query returns.
export interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ssoUserId: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerName: string | null;
  ownerLogo: string | null;
  projectCount: number;
  repositoryCount: number;
  likeCount: number;
  featuredProjects: { name: string; slug: string; logoUrl: string | null }[];
}

// `type` follows Nuxt and reads ssoUserId, which Postgres nulls when the owner is deleted, so that collection becomes `curated`.
export const toCollection = (row: CollectionRow): Collection => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description || null,
  type: row.ssoUserId === null ? 'curated' : 'community',
  projectCount: row.projectCount,
  repositoryCount: row.repositoryCount,
  likeCount: row.likeCount,
  featuredProjects: row.featuredProjects.map((project) => ({
    name: project.name,
    slug: project.slug,
    logoUrl: project.logoUrl || null,
  })),
  owner: row.ownerName ? { name: row.ownerName, logoUrl: row.ownerLogo || null } : null,
  logoUrl: row.logoUrl || null,
  imageUrl: row.imageUrl || null,
  color: row.color || null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const CollectionProjectType = dataEnum(
  ['project', 'repo'] as const,
  '`project` is an Insights project; `repo` is a repository added to the collection on its own.',
);

const ProjectStatus = nullableEnum(
  ['active', 'archived', 'formation'] as const,
  'Lifecycle status of the project. Null when it has none.',
);

const Achievement = Type.Object({
  leaderboardType: LeaderboardType,
  rank: Type.Integer({ minimum: 1, description: 'Position on the leaderboard, 1-based.' }),
  totalCount: Type.Integer({ minimum: 0, description: 'Entries ranked on the leaderboard.' }),
});

export const CollectionProject = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the project or repository.' }),
    type: CollectionProjectType,
    name: Type.String({ description: 'Display name of the project or repository.' }),
    slug: Type.String({
      description:
        'Slug of the project, or of the project that holds the repository, as used in `GET /v1-alpha/projects/{slug}`.',
    }),
    repoUrl: nullableString('URL of the repository. Null when `type` is `project`.'),
    logoUrl: nullableString('URL of the project logo. Null when it has none.'),
    isLF: Type.Boolean({ description: 'Whether the project is a Linux Foundation project.' }),
    status: ProjectStatus,
    contributorCount: Type.Integer({
      minimum: 0,
      description: 'Contributors over the whole history (count).',
    }),
    organizationCount: Type.Integer({
      minimum: 0,
      description: 'Organizations over the whole history (count).',
    }),
    softwareValue: Type.Integer({
      minimum: 0,
      description: 'Estimated cost to rebuild the software, in US dollars.',
    }),
    contributorDependencyCount: Type.Integer({
      minimum: 0,
      description:
        'Contributors in the top group (count): the smallest set, from the most contributions down, whose shares reach 51% of the contributions.',
    }),
    contributorDependencyPercentage: Type.Number({
      description: 'Combined share of the contributions the top contributor group made (percent).',
    }),
    organizationDependencyCount: Type.Integer({
      minimum: 0,
      description:
        'Organizations in the top group (count): the smallest set, from the most contributions down, whose shares reach 51% of the contributions.',
    }),
    organizationDependencyPercentage: Type.Number({
      description: 'Combined share of the contributions the top organization group made (percent).',
    }),
    achievements: Type.Array(Achievement, {
      description: 'Leaderboards the project ranks on. Empty for a `repo`.',
    }),
    healthScore: nullableNumber(
      'Health score, the sum of the three category scores, from 0 to `healthMaxScore`. Null when fewer than two categories have data.',
    ),
    healthLabel: HealthLabel,
    healthMaxScore: nullableNumber(
      'Highest score the covered categories allow: 60, 65, 75 or 100. Null for a `repo` and when unknown.',
    ),
    maintainerHealthScore: nullableNumber(
      'Maintainer health category score, from 0 to 40 points. Null when the category has no data.',
    ),
    securitySupplyChainScore: nullableNumber(
      'Security and supply chain category score, from 0 to 35 points. Null when the category has no data.',
    ),
    developmentActivityScore: nullableNumber(
      'Development activity category score, from 0 to 25 points. Null when the category has no data.',
    ),
    lifecycleLabel: LifecycleLabel,
    impactScore: nullableNumber('Impact score, from 0 to 100. Null when unknown.'),
    impactLabel: ImpactLabel,
  },
  { title: 'CollectionProject' },
);
export type CollectionProject = Static<typeof CollectionProject>;

type Score = number | null;

// The project_repo_insights columns toCollectionProject keeps. The pipe's V1 health scores and
// 365-day counts stay out because the collection page shows neither.
export interface CollectionProjectRow {
  id: string;
  type: string;
  repoUrl: string;
  name: string;
  slug: string;
  logoUrl: string;
  isLF: number;
  status: string;
  contributorCount: number;
  organizationCount: number;
  softwareValue: number;
  contributorDependencyCount: number;
  contributorDependencyPercentage: number;
  organizationDependencyCount: number;
  organizationDependencyPercentage: number;
  achievements: [string, number, number][];
  healthScoreV2: Score;
  healthLabel: string | null;
  healthMaxScore: Score;
  maintainerHealthScoreV2: Score;
  securitySupplyChainScoreV2: Score;
  developmentActivityScoreV2: Score;
  lifecycleLabel: string | null;
  impactScore: Score;
  impactLabel: string | null;
}

const isProjectType = enumGuard(CollectionProjectType);
const isStatus = enumGuard(ProjectStatus);
const isHealthLabel = enumGuard(HealthLabel);
const isLifecycleLabel = enumGuard(LifecycleLabel);
const isImpactLabel = enumGuard(ImpactLabel);
const isLeaderboardType = enumGuard(LeaderboardType);

const isScore = (value: unknown) => value === null || isCount(value);
const isPercentage = (value: unknown) => Number.isFinite(value);

const isAchievement = (value: unknown) =>
  Array.isArray(value) &&
  value.length === 3 &&
  isLeaderboardType(value[0]) &&
  Number.isSafeInteger(value[1]) &&
  value[1] >= 1 &&
  isCount(value[2]);

export const isCollectionProjectRow = (row: unknown): row is CollectionProjectRow => {
  if (typeof row !== 'object' || row === null || Array.isArray(row)) {
    return false;
  }
  const candidate = row as Record<string, unknown>;
  return (
    isString(candidate.id) &&
    isProjectType(candidate.type) &&
    isString(candidate.repoUrl) &&
    isString(candidate.name) &&
    isString(candidate.slug) &&
    isString(candidate.logoUrl) &&
    (candidate.isLF === 0 || candidate.isLF === 1) &&
    (candidate.status === '' || isStatus(candidate.status)) &&
    isCount(candidate.contributorCount) &&
    isCount(candidate.organizationCount) &&
    isCount(candidate.softwareValue) &&
    isCount(candidate.contributorDependencyCount) &&
    isPercentage(candidate.contributorDependencyPercentage) &&
    isCount(candidate.organizationDependencyCount) &&
    isPercentage(candidate.organizationDependencyPercentage) &&
    Array.isArray(candidate.achievements) &&
    candidate.achievements.every(isAchievement) &&
    isScore(candidate.healthScoreV2) &&
    isHealthLabel(candidate.healthLabel) &&
    isScore(candidate.healthMaxScore) &&
    isScore(candidate.maintainerHealthScoreV2) &&
    isScore(candidate.securitySupplyChainScoreV2) &&
    isScore(candidate.developmentActivityScoreV2) &&
    isLifecycleLabel(candidate.lifecycleLabel) &&
    isScore(candidate.impactScore) &&
    isImpactLabel(candidate.impactLabel)
  );
};

// The pipe sends tuples for achievements and empty strings for missing values.
export const toCollectionProject = (row: CollectionProjectRow): CollectionProject => ({
  id: row.id,
  type: row.type as CollectionProject['type'],
  name: row.name,
  slug: row.slug,
  repoUrl: row.repoUrl || null,
  logoUrl: row.logoUrl || null,
  isLF: row.isLF === 1,
  status: (row.status || null) as CollectionProject['status'],
  contributorCount: row.contributorCount,
  organizationCount: row.organizationCount,
  softwareValue: row.softwareValue,
  contributorDependencyCount: row.contributorDependencyCount,
  contributorDependencyPercentage: row.contributorDependencyPercentage,
  organizationDependencyCount: row.organizationDependencyCount,
  organizationDependencyPercentage: row.organizationDependencyPercentage,
  achievements: row.achievements.map(([leaderboardType, rank, totalCount]) => ({
    leaderboardType:
      leaderboardType as CollectionProject['achievements'][number]['leaderboardType'],
    rank,
    totalCount,
  })),
  healthScore: row.healthScoreV2,
  healthLabel: row.healthLabel as CollectionProject['healthLabel'],
  healthMaxScore: row.healthMaxScore,
  maintainerHealthScore: row.maintainerHealthScoreV2,
  securitySupplyChainScore: row.securitySupplyChainScoreV2,
  developmentActivityScore: row.developmentActivityScoreV2,
  lifecycleLabel: row.lifecycleLabel as CollectionProject['lifecycleLabel'],
  impactScore: row.impactScore,
  impactLabel: row.impactLabel as CollectionProject['impactLabel'],
});
