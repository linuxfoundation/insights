// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static } from '@sinclair/typebox';
import { Granularity as SharedGranularity } from '@lfx-insights/types';

// Any non-empty slug passes, so an unknown project reaches the handler and returns empty data.
export const ProjectSlugParams = Type.Object({
  slug: Type.String({ minLength: 1 }),
});

export const DateRangeQuery = Type.Object({
  // Fastify's default Ajv coerces a single repos=x to ['x'] (coerceTypes: 'array').
  repos: Type.Optional(Type.Array(Type.String(), { description: 'Repository URLs to filter by.' })),
  startDate: Type.Optional(
    Type.String({
      format: 'date',
      description: 'Start of the period, as a UTC calendar day (YYYY-MM-DD).',
    }),
  ),
  endDate: Type.Optional(
    Type.String({
      format: 'date',
      description: 'End of the period, as a UTC calendar day (YYYY-MM-DD).',
    }),
  ),
});

// Type.Unsafe shows up in OpenAPI as a plain enum, where a literal union becomes anyOf of consts.
// The template literal derives the API's five values from the shared enum, omitting hourly.
export const Granularity = Type.Unsafe<`${Exclude<SharedGranularity, SharedGranularity.HOURLY>}`>({
  type: 'string',
  enum: [
    SharedGranularity.DAILY,
    SharedGranularity.WEEKLY,
    SharedGranularity.MONTHLY,
    SharedGranularity.QUARTERLY,
    SharedGranularity.YEARLY,
  ],
});

export const PeriodSummary = Type.Object(
  {
    current: Type.Number(),
    previous: Type.Number(),
    // The spec is OpenAPI 3.0.3, which has no type 'null'. Ajv and fast-json-stringify
    // both honor nullable.
    percentageChange: Type.Unsafe<number | null>({
      type: 'number',
      nullable: true,
      description:
        'Signed percent change from previous to current. Null if previous is 0 and current is not.',
    }),
    changeValue: Type.Number(),
    periodFrom: Type.String({ format: 'date-time', description: 'Start of the current period.' }),
    periodTo: Type.String({ format: 'date-time', description: 'End of the current period.' }),
  },
  { title: 'PeriodSummary' },
);
export type PeriodSummary = Static<typeof PeriodSummary>;
