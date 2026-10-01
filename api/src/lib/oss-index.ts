// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static } from '@sinclair/typebox';

import { dataEnum, isCount, isString } from './security.js';

// The pipes return these rows as positional tuples, so each slot is checked by type before the
// route names it. The columns are non-nullable in the pipes, so a null is a malformed row.
export type TopCollectionTuple = [
  id: string,
  count: number,
  name: string,
  softwareValue: number,
  avgScore: number,
];

export type TopProjectTuple = [
  id: string,
  count: number,
  name: string,
  logo: string,
  softwareValue: number,
  avgScore: number,
  healthScore: number,
  description: string,
  status: string,
];

// Counts and the UInt64 software value must be non-negative safe integers; only the Float64
// scores use the finite-number check.
const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);

export const isTopCollectionTuple = (value: unknown): value is TopCollectionTuple =>
  Array.isArray(value) &&
  value.length === 5 &&
  isString(value[0]) &&
  isCount(value[1]) &&
  isString(value[2]) &&
  isCount(value[3]) &&
  isNumber(value[4]);

export const isTopProjectTuple = (value: unknown): value is TopProjectTuple =>
  Array.isArray(value) &&
  value.length === 9 &&
  isString(value[0]) &&
  isCount(value[1]) &&
  isString(value[2]) &&
  isString(value[3]) &&
  isCount(value[4]) &&
  isNumber(value[5]) &&
  isNumber(value[6]) &&
  isString(value[7]) &&
  isString(value[8]);

export const TopCollection = Type.Object(
  {
    id: Type.String({ description: 'Identifier of the collection.' }),
    count: Type.Integer({ minimum: 0, description: 'Contributors in the collection.' }),
    name: Type.String({ description: 'Display name of the collection.' }),
    softwareValue: Type.Integer({ minimum: 0, description: 'Software value of the collection.' }),
    avgScore: Type.Number({ description: 'Average health score of the collection, from 0 to 1.' }),
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
    avgScore: Type.Number({ description: 'Average score of the project, from 0 to 1.' }),
    healthScore: Type.Number({ description: 'Health score of the project, from 0 to 100.' }),
    status: Type.String({ description: 'Lifecycle status of the project, for example `active`.' }),
  },
  { title: 'TopProject' },
);
export type TopProject = Static<typeof TopProject>;

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
  healthScore,
  description,
  status,
]: TopProjectTuple): TopProject => ({
  id,
  count,
  name,
  logoUrl: logo,
  description,
  softwareValue,
  avgScore,
  healthScore,
  status,
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
