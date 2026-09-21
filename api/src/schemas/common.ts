// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static, type TSchema } from '@sinclair/typebox';
import { Granularity as SharedGranularity } from '@lfx-insights/types';

// Any non-empty slug passes, so an unknown project reaches the handler and returns empty data.
export const ProjectSlugParams = Type.Object({
  slug: Type.String({ minLength: 1 }),
});

// Both bounds go to Tinybird at 00:00 UTC and the pipes compare with > and <, so the descriptions
// spell out the inclusive start and exclusive end.
export const DateRangeQuery = Type.Object({
  // Fastify's default Ajv coerces a single repos=x to ['x'] (coerceTypes: 'array').
  repos: Type.Optional(Type.Array(Type.String(), { description: 'Repository URLs to filter by.' })),
  startDate: Type.Optional(
    Type.String({
      format: 'date',
      description:
        'Start of the period, as a UTC calendar day (YYYY-MM-DD). Inclusive: the period starts at 00:00 UTC on this day.',
    }),
  ),
  endDate: Type.Optional(
    Type.String({
      format: 'date',
      description:
        'End of the period, as a UTC calendar day (YYYY-MM-DD). Exclusive: the period ends at 00:00 UTC on this day, so activity on this day is outside it, as in the Insights widgets.',
    }),
  ),
});

// Keeps the shared schema as the source of the field's type and adds an endpoint's own wording.
export const describe = <T extends TSchema>(schema: T, description: string): T => ({
  ...schema,
  description,
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
  description: 'Width of each bucket in `data`.',
});

// The query of every bucketed series endpoint; spread `.properties` to add endpoint-specific keys.
export const SeriesQuery = Type.Object({
  ...DateRangeQuery.properties,
  granularity: Granularity,
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

interface PeriodSummaryOptions {
  /** Names what is measured and opens each field description, e.g. 'Commits' or 'Active days'. */
  measure: string;
  /** Unit written after `current` and `previous`, e.g. 'count', 'count of days', 'percent'. */
  unit: string;
  /** Unit of `changeValue` when it differs from `unit`, e.g. 'percentage points'. */
  changeUnit?: string;
  /** Integer for a count, number for a share. */
  kind: 'integer' | 'number';
  title?: string;
  description?: string;
}

// PeriodSummary leaves its three plain numbers undescribed because the unit is per metric. This
// writes them from the measure and unit, so every endpoint's summary reads the same way.
export function periodSummary({
  measure,
  unit,
  changeUnit = unit,
  kind,
  title,
  description,
}: PeriodSummaryOptions) {
  const numeric = (text: string) =>
    kind === 'integer' ? Type.Integer({ description: text }) : Type.Number({ description: text });
  return Type.Object(
    {
      ...PeriodSummary.properties,
      current: numeric(`${measure} in the current period (${unit}).`),
      previous: numeric(
        `${measure} in the comparison period, which ends the day before \`periodFrom\`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (${unit}).`,
      ),
      changeValue: numeric(`\`current\` minus \`previous\` (${changeUnit}).`),
    },
    { ...(title ? { title } : {}), ...(description ? { description } : {}) },
  );
}
