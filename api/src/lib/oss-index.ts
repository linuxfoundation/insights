// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static } from '@sinclair/typebox';

import { nullableNumber } from '../schemas/common.js';
import { HealthLabel, isHealthScore } from './overview.js';
import { dataEnum, inRange, isCount, isString } from './security.js';

// The pipes return positional tuples, so each slot is type-checked before the route names it. Project
// tuples keep the v1 health score, which the API drops, and end in the nullable v2 health fields.
export type TopCollectionTuple = [
  id: string,
  count: number,
  name: string,
  softwareValue: number,
  avgScore: number,
];

type ProjectHead = [
  id: string,
  count: number,
  name: string,
  logo: string,
  softwareValue: number,
  avgScore: number,
  v1HealthScore: number,
  description: string,
];

type HealthTail = [
  healthScore: number | null,
  healthLabel: string | null,
  scaledHealthScore: number | null,
  healthMaxScore: number | null,
];

export type TopProjectTuple = [...head: ProjectHead, status: string, ...health: HealthTail];

// The categories pipe returns the project tuple without its status slot.
export type CategoryTopProjectTuple = [...head: ProjectHead, ...health: HealthTail];

// Counts and the UInt64 software value must be non-negative safe integers. The 0-1 averages use
// inRange; the dropped v1 score only needs a finite number.
const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const isNullableNumber = (value: unknown) => value === null || isNumber(value);

export const isTopCollectionTuple = (value: unknown): value is TopCollectionTuple =>
  Array.isArray(value) &&
  value.length === 5 &&
  isString(value[0]) &&
  isCount(value[1]) &&
  isString(value[2]) &&
  isCount(value[3]) &&
  inRange(value[4], 1);

const isProjectHead = (value: unknown[]) =>
  isString(value[0]) &&
  isCount(value[1]) &&
  isString(value[2]) &&
  isString(value[3]) &&
  isCount(value[4]) &&
  inRange(value[5] as number, 1) &&
  isNumber(value[6]) &&
  isString(value[7]);

const isHealthTail = (value: unknown[], start: number) =>
  isHealthScore(value[start], value[start + 1], value[start + 3]) &&
  isNullableNumber(value[start + 2]);

export const isTopProjectTuple = (value: unknown): value is TopProjectTuple =>
  Array.isArray(value) &&
  value.length >= 13 &&
  isProjectHead(value) &&
  isString(value[8]) &&
  isHealthTail(value, 9);

export const isCategoryTopProjectTuple = (value: unknown): value is CategoryTopProjectTuple =>
  Array.isArray(value) && value.length >= 12 && isProjectHead(value) && isHealthTail(value, 8);

export const TopCollection = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the collection.' }),
    count: Type.Integer({ minimum: 0, description: 'Contributors in the collection.' }),
    name: Type.String({ description: 'Display name of the collection.' }),
    softwareValue: Type.Integer({ minimum: 0, description: 'Software value of the collection.' }),
    avgScore: Type.Number({
      minimum: 0,
      maximum: 1,
      description: 'Average health score of the collection, from 0 to 1.',
    }),
  },
  { title: 'TopCollection' },
);
export type TopCollection = Static<typeof TopCollection>;

export const TopProject = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the project.' }),
    count: Type.Integer({ minimum: 0, description: 'Contributors to the project.' }),
    name: Type.String({ description: 'Display name of the project.' }),
    logoUrl: Type.String({ description: 'URL of the project logo.' }),
    description: Type.String({ description: 'Short description of the project.' }),
    softwareValue: Type.Integer({ minimum: 0, description: 'Software value of the project.' }),
    avgScore: Type.Number({
      minimum: 0,
      maximum: 1,
      description: 'Average score of the project, from 0 to 1.',
    }),
    healthScore: nullableNumber(
      'Health score, the sum of the three category scores, from 0 to `healthMaxScore`. Null when fewer than two categories have data.',
    ),
    healthLabel: HealthLabel,
    healthMaxScore: nullableNumber(
      'Highest score the covered categories allow: 60, 65, 75 or 100. Null when unknown.',
    ),
    status: Type.String({ description: 'Lifecycle status of the project, for example `active`.' }),
  },
  { title: 'TopProject' },
);
export type TopProject = Static<typeof TopProject>;

export const CategoryTopProject = Type.Omit(TopProject, ['status'], {
  title: 'CategoryTopProject',
});
export type CategoryTopProject = Static<typeof CategoryTopProject>;

export const toTopCollection = ([
  id,
  count,
  name,
  softwareValue,
  avgScore,
]: TopCollectionTuple): TopCollection => ({ id, count, name, softwareValue, avgScore });

export const toTopProject = ([
  id,
  count,
  name,
  logo,
  softwareValue,
  avgScore,
  ,
  description,
  status,
  healthScore,
  healthLabel,
  ,
  healthMaxScore,
]: TopProjectTuple): TopProject => ({
  id,
  count,
  name,
  logoUrl: logo,
  description,
  softwareValue,
  avgScore,
  healthScore,
  healthLabel: healthLabel as TopProject['healthLabel'],
  healthMaxScore,
  status,
});

export const toCategoryTopProject = ([
  id,
  count,
  name,
  logo,
  softwareValue,
  avgScore,
  ,
  description,
  healthScore,
  healthLabel,
  ,
  healthMaxScore,
]: CategoryTopProjectTuple): CategoryTopProject => ({
  id,
  count,
  name,
  logoUrl: logo,
  description,
  softwareValue,
  avgScore,
  healthScore,
  healthLabel: healthLabel as CategoryTopProject['healthLabel'],
  healthMaxScore,
});

export const sortValues = ['totalContributors', 'softwareValue'] as const;

export const sortQuery = Type.Object({
  sort: Type.Optional(
    dataEnum(
      sortValues,
      'Orders the results, highest first. Defaults to `totalContributors`; `softwareValue` orders by software value.',
    ),
  ),
});

// The collections pipe inserts the project slug before status, so its tuples cannot reuse the
// positional checks of the 9 slot shape.
export type CollectionProjectTuple = [
  id: string,
  count: number,
  name: string,
  logo: string,
  softwareValue: number,
  avgScore: number,
  healthScore: number,
  description: string,
  slug: string,
  status: string,
];

export const isCollectionProjectTuple = (value: unknown): value is CollectionProjectTuple =>
  Array.isArray(value) &&
  value.length === 10 &&
  isString(value[0]) &&
  isCount(value[1]) &&
  isString(value[2]) &&
  isString(value[3]) &&
  isCount(value[4]) &&
  isNumber(value[5]) &&
  isNumber(value[6]) &&
  isString(value[7]) &&
  isString(value[8]) &&
  isString(value[9]);

export const CollectionProject = Type.Object(
  {
    ...TopProject.properties,
    slug: Type.String({ description: 'URL slug of the project.' }),
  },
  { title: 'CollectionProject' },
);
export type CollectionProject = Static<typeof CollectionProject>;

export const toCollectionProject = ([
  id,
  count,
  name,
  logo,
  softwareValue,
  avgScore,
  healthScore,
  description,
  slug,
  status,
]: CollectionProjectTuple): CollectionProject => ({
  id,
  count,
  name,
  slug,
  logoUrl: logo,
  description,
  softwareValue,
  avgScore,
  healthScore,
  status,
});
