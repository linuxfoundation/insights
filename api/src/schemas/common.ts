// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static, type TSchema } from '@sinclair/typebox';

import { ActivityPlatforms, Granularity as SharedGranularity } from '@lfx-insights/types';

// The spec is OpenAPI 3.0.3, which has no type 'null'. Ajv and fast-json-stringify both honor
// nullable.
export const nullableNumber = (description: string) =>
  Type.Unsafe<number | null>({ type: 'number', nullable: true, description });

export const ProjectSlugParams = Type.Object({
  slug: Type.String({ minLength: 1 }),
});

export const DateRangeQuery = Type.Object({
  // Fastify's default Ajv coerces a single repos=x to ['x'] (coerceTypes: 'array').
  repos: Type.Optional(Type.Array(Type.String(), { description: 'Repository URLs to filter by.' })),
  startDate: Type.Optional(
    Type.String({
      format: 'date',
      description:
        'Start of the period, as a UTC calendar day (YYYY-MM-DD). Inclusive: the period starts at 00:00 UTC on this day. The earliest accepted day is 2000-01-01.',
    }),
  ),
  endDate: Type.Optional(
    Type.String({
      format: 'date',
      description:
        'End of the period, as a UTC calendar day (YYYY-MM-DD). Exclusive: the period ends at 00:00 UTC on this day, so activity on this day is outside it, as in the Insights widgets. The latest accepted day is today in UTC.',
    }),
  ),
});

export const describe = <T extends TSchema>(schema: T, description: string): T => ({
  ...schema,
  description,
});

// Type.Unsafe shows up in OpenAPI as a plain enum, where a literal union becomes anyOf of consts.
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

export const Platform =
  Type.Unsafe<`${ActivityPlatforms.GITHUB | ActivityPlatforms.GITLAB | ActivityPlatforms.GERRIT}`>({
    type: 'string',
    enum: [ActivityPlatforms.GITHUB, ActivityPlatforms.GITLAB, ActivityPlatforms.GERRIT],
    description:
      'Count only pull requests from this platform: `github` pull requests, `gitlab` merge requests or `gerrit` changesets. These are the pull request platforms among the `connectedPlatforms` the project endpoint returns; other values there, such as `git`, get a 400. When omitted, all three are counted together.',
  });

export const ContributionFlags = Type.Object({
  includeCollaborations: Type.Optional(
    Type.Boolean({
      default: false,
      description: 'Count collaboration activity, such as reviews and comments, as contributions.',
    }),
  ),
  includeCodeContributions: Type.Optional(
    Type.Boolean({
      default: true,
      description: 'Count code contributions, such as commits, pull requests and patchsets.',
    }),
  ),
});

// The data holds platforms and type keys that the ActivityPlatforms and ActivityTypes enums lack or
// spell differently, so the data decides the valid values. `all`, the Insights sentinel, is refused:
// omitting the parameter means every value.
const dataValue = (description: string) =>
  Type.String({ pattern: '^[\\w-]+$', maxLength: 100, not: { enum: ['all'] }, description });

export const ActivityPlatform = dataValue(
  'Count only activity on this platform: one of the `platform`s that `GET /v1-alpha/projects/{slug}/activity-types` lists for the project. A platform with no data returns empty results. Omit it to count activity on every platform.',
);

export const ActivityType = dataValue(
  'Count only activity of this type: one of the `key`s that `GET /v1-alpha/projects/{slug}/activity-types` lists for the project. A type with no data returns empty results. Omit it to count every type.',
);

export const SeriesQuery = Type.Object({
  ...DateRangeQuery.properties,
  granularity: Granularity,
});

export const PeriodSummary = Type.Object(
  {
    current: Type.Number(),
    previous: Type.Number(),
    percentageChange: nullableNumber(
      'Signed percent change from previous to current. Null if previous is 0 and current is not.',
    ),
    changeValue: Type.Number(),
    periodFrom: Type.String({ format: 'date-time', description: 'Start of the current period.' }),
    periodTo: Type.String({ format: 'date-time', description: 'End of the current period.' }),
  },
  { title: 'PeriodSummary' },
);
export type PeriodSummary = Static<typeof PeriodSummary>;

interface PeriodSummaryText {
  /** Names what is measured and opens each field description, e.g. 'Commits' or 'Active days'. */
  measure: string;
  /** Unit written after `current` and `previous`, e.g. 'count', 'count of days', 'percent'. */
  unit: string;
  /** Unit of `changeValue` when it differs from `unit`, e.g. 'percentage points'. */
  changeUnit?: string;
  title?: string;
  description?: string;
}

interface PeriodSummaryOptions extends PeriodSummaryText {
  kind: 'integer' | 'number';
}

interface NullablePeriodSummaryOptions extends PeriodSummaryText {
  /** Appended to `current` and `previous`, e.g. 'Null when no pull request was opened in the period.' */
  nullWhen: { current: string; previous: string };
}

// PeriodSummary leaves its three numbers undescribed because the unit is per metric.
const summaryText = ({ measure, unit, changeUnit = unit }: PeriodSummaryText) => ({
  current: `${measure} in the current period (${unit}).`,
  previous: `${measure} in the comparison period, which ends the day before \`periodFrom\`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (${unit}).`,
  changeValue: `\`current\` minus \`previous\` (${changeUnit}).`,
});

const objectOptions = ({ title, description }: { title?: string; description?: string }) => ({
  ...(title ? { title } : {}),
  ...(description ? { description } : {}),
});

export function periodSummary(options: PeriodSummaryOptions) {
  const text = summaryText(options);
  const numeric = (description: string) =>
    options.kind === 'integer' ? Type.Integer({ description }) : Type.Number({ description });
  return Type.Object(
    {
      ...PeriodSummary.properties,
      current: numeric(text.current),
      previous: numeric(text.previous),
      changeValue: numeric(text.changeValue),
    },
    objectOptions(options),
  );
}

// For a value an empty period has none of, such as a median, an average or a ratio.
export function nullablePeriodSummary(options: NullablePeriodSummaryOptions) {
  const text = summaryText(options);
  return Type.Object(
    {
      ...PeriodSummary.properties,
      current: nullableNumber(`${text.current} ${options.nullWhen.current}`),
      previous: nullableNumber(`${text.previous} ${options.nullWhen.previous}`),
      changeValue: nullableNumber(
        `${text.changeValue} Null when \`current\` or \`previous\` is null.`,
      ),
      percentageChange: nullableNumber(
        'Signed percent change from `previous` to `current`. Null when `current` or `previous` is null, or when `previous` is 0 and `current` is not.',
      ),
    },
    objectOptions(options),
  );
}
export type NullablePeriodSummary = Static<ReturnType<typeof nullablePeriodSummary>>;

export const PaginationQuery = Type.Object({
  cursor: Type.Optional(
    Type.String({
      description:
        'Opaque cursor for the next page: the `nextCursor` of the previous response, passed back unchanged. Omit it for the first page.',
    }),
  ),
  pageSize: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 200,
      default: 50,
      description: 'Maximum number of items in `data`, from 1 to 200.',
    }),
  ),
});

export function paginated<T extends TSchema>(item: T, options: { data: string }) {
  return Type.Object({
    data: Type.Array(item, { description: options.data }),
    pageSize: Type.Integer({
      description: 'Page size of this response: the `pageSize` sent, or 50 when it was omitted.',
    }),
    nextCursor: Type.Unsafe<string | null>({
      type: 'string',
      nullable: true,
      description: 'Pass it as `cursor` to get the next page. Null on the last page.',
    }),
  });
}
