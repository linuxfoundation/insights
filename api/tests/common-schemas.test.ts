// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { getPreviousDates, toPeriodSummary } from '../src/lib/period.js';
import {
  DateRangeQuery,
  describe as describeField,
  Granularity,
  PeriodSummary,
  periodSummary,
  ProjectSlugParams,
  SeriesQuery,
} from '../src/schemas/common.js';
import type { ApiVersion } from '../src/versions/registry.js';

interface OpenApiSchema {
  $ref?: string;
  type?: string;
  enum?: string[];
  format?: string;
  nullable?: boolean;
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
}

interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema: OpenApiSchema;
}

interface OpenApiOperation {
  description?: string;
  parameters?: OpenApiParameter[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

interface OpenApiDoc {
  components?: { schemas?: Record<string, OpenApiSchema> };
  paths: Record<string, { get?: OpenApiOperation }>;
}

const granularities = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

// Swagger writes a query property's description on the parameter; older output kept it on the schema.
const parameterDescription = (param?: OpenApiParameter) =>
  param?.description ?? param?.schema.description;

// A throwaway version that wires the shared pieces together the way an endpoint will.
const testVersion: ApiVersion = {
  prefix: '/v1',
  plugin: async (scope) => {
    scope.get(
      '/projects/:slug/echo',
      {
        schema: {
          params: ProjectSlugParams,
          querystring: Type.Object({
            ...DateRangeQuery.properties,
            granularity: Type.Optional(Granularity),
          }),
        },
      },
      async (request) => ({ params: request.params, query: request.query }),
    );
    scope.get(
      '/projects/:slug/summary',
      {
        schema: {
          params: ProjectSlugParams,
          querystring: DateRangeQuery,
          response: { 200: Type.Object({ summary: PeriodSummary }) },
        },
      },
      async (request) => {
        const { current } = getPreviousDates(request.query.startDate, request.query.endDate);
        return { summary: toPeriodSummary(5, 0, current) };
      },
    );
    scope.get(
      '/projects/:slug/series',
      { schema: { params: ProjectSlugParams, querystring: SeriesQuery } },
      async (request) => ({ query: request.query }),
    );
  },
};

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ versions: [testVersion] });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

const get = (url: string) => app.inject({ method: 'GET', url });

async function getOperation(path: string): Promise<OpenApiOperation> {
  const res = await get('/v1/openapi.json');
  expect(res.statusCode).toBe(200);
  const operation = res.json<OpenApiDoc>().paths[path]?.get;
  expect(operation, `${path} is missing from the spec`).toBeDefined();
  return operation as OpenApiOperation;
}

describe('ProjectSlugParams (AC1)', () => {
  it.each(['kubernetes', 'linux-kernel', 'Some_Project.v2'])('accepts %s', async (slug) => {
    const res = await get(`/v1/projects/${slug}/echo`);
    expect(res.statusCode).toBe(200);
    expect(res.json().params).toEqual({ slug });
  });

  it('rejects an empty slug', async () => {
    const res = await get('/v1/projects//echo');
    expect(res.statusCode).toBe(400);
  });
});

describe('DateRangeQuery (AC2)', () => {
  const kubernetes = 'https://github.com/kubernetes/kubernetes';
  const website = 'https://github.com/kubernetes/website';

  it('accepts a request with none of the fields', async () => {
    const res = await get('/v1/projects/kubernetes/echo');
    expect(res.statusCode).toBe(200);
    expect(res.json().query).toEqual({});
  });

  it('turns a single repos value into a one-item array', async () => {
    const res = await get(`/v1/projects/kubernetes/echo?repos=${encodeURIComponent(kubernetes)}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().query.repos).toEqual([kubernetes]);
  });

  it('collects repeated repos keys into an array', async () => {
    const res = await get(
      `/v1/projects/kubernetes/echo?repos=${encodeURIComponent(kubernetes)}&repos=${encodeURIComponent(website)}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json().query.repos).toEqual([kubernetes, website]);
  });

  it('accepts YYYY-MM-DD dates', async () => {
    const res = await get('/v1/projects/kubernetes/echo?startDate=2025-06-20&endDate=2025-09-18');
    expect(res.statusCode).toBe(200);
    expect(res.json().query).toEqual({ startDate: '2025-06-20', endDate: '2025-09-18' });
  });

  it.each(['2025-13-01', '2025-06-20T00:00:00Z', 'yesterday'])(
    'rejects startDate=%s',
    async (value) => {
      const res = await get(`/v1/projects/kubernetes/echo?startDate=${encodeURIComponent(value)}`);
      expect(res.statusCode).toBe(400);
    },
  );

  it('rejects a malformed endDate', async () => {
    const res = await get('/v1/projects/kubernetes/echo?endDate=2025-09-18T00%3A00%3A00Z');
    expect(res.statusCode).toBe(400);
  });
});

describe('Granularity (AC3)', () => {
  it.each(granularities)('accepts %s', async (granularity) => {
    const res = await get(`/v1/projects/kubernetes/echo?granularity=${granularity}`);
    expect(res.statusCode).toBe(200);
    expect(res.json().query.granularity).toBe(granularity);
  });

  it.each(['hourly', 'fortnightly'])('rejects %s', async (granularity) => {
    const res = await get(`/v1/projects/kubernetes/echo?granularity=${granularity}`);
    expect(res.statusCode).toBe(400);
  });

  it('shows exactly the five values as a plain enum in OpenAPI', async () => {
    const operation = await getOperation('/v1/projects/{slug}/echo');
    const param = operation.parameters?.find((p) => p.name === 'granularity');
    expect(param?.schema.enum).toEqual(granularities);
  });
});

describe('PeriodSummary (AC4)', () => {
  it('serializes a null percentageChange and keeps the key', async () => {
    const res = await get(
      '/v1/projects/kubernetes/summary?startDate=2025-06-20&endDate=2025-09-18',
    );
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      summary: {
        current: 5,
        previous: 0,
        percentageChange: null,
        changeValue: 5,
        periodFrom: '2025-06-20T00:00:00Z',
        periodTo: '2025-09-18T00:00:00Z',
      },
    });
  });

  it('documents percentageChange as nullable and the period bounds as date-time', async () => {
    const operation = await getOperation('/v1/projects/{slug}/summary');
    const summary =
      operation.responses['200']?.content['application/json']?.schema.properties?.summary;
    expect(summary?.title).toBe('PeriodSummary');
    expect(summary?.required).toEqual(
      expect.arrayContaining([
        'current',
        'previous',
        'percentageChange',
        'changeValue',
        'periodFrom',
        'periodTo',
      ]),
    );
    expect(summary?.properties?.percentageChange).toMatchObject({
      type: 'number',
      nullable: true,
    });
    expect(summary?.properties?.periodFrom?.format).toBe('date-time');
    expect(summary?.properties?.periodTo?.format).toBe('date-time');
  });
});

describe('an inverted date range through a route (AC5)', () => {
  it('returns 400 invalid_request', async () => {
    const res = await get(
      '/v1/projects/kubernetes/summary?startDate=2025-09-19&endDate=2025-09-18',
    );
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: 'invalid_request' });
  });
});

describe('DateRangeQuery descriptions state the bound semantics (AC8)', () => {
  it('documents startDate as inclusive from 00:00 UTC and endDate as exclusive at 00:00 UTC', async () => {
    const operation = await getOperation('/v1/projects/{slug}/echo');
    const byName = Object.fromEntries(
      (operation.parameters ?? []).map((param) => [param.name, param]),
    );
    expect(parameterDescription(byName['startDate'])).toMatch(/inclusive/i);
    expect(parameterDescription(byName['startDate'])).toMatch(/00:00(:00)? UTC/);
    expect(parameterDescription(byName['endDate'])).toMatch(/exclusive/i);
    expect(parameterDescription(byName['endDate'])).toMatch(/00:00(:00)? UTC/);
  });

  it('keeps the schema-level descriptions in step with the served ones', () => {
    expect(DateRangeQuery.properties.startDate.description).toMatch(/inclusive/i);
    expect(DateRangeQuery.properties.endDate.description).toMatch(/exclusive/i);
  });
});

describe('describe() (AC6)', () => {
  it('returns the schema with only the description replaced', () => {
    const described = describeField(Granularity, 'Bucket width for this endpoint.');
    expect(described).toEqual({ ...Granularity, description: 'Bucket width for this endpoint.' });
    expect(described.enum).toBe(Granularity.enum);
    expect(described).not.toBe(Granularity);
  });

  it('leaves the source schema untouched', () => {
    const before = { ...Granularity };
    describeField(Granularity, 'Something else.');
    expect(Granularity).toEqual(before);
  });
});

describe('Granularity and SeriesQuery (AC7)', () => {
  it('carries a description on the shared schema', () => {
    expect(Granularity.description).toBe('Width of each bucket in `data`.');
  });

  it('SeriesQuery is DateRangeQuery plus a required granularity', () => {
    expect(Object.keys(SeriesQuery.properties)).toEqual([
      ...Object.keys(DateRangeQuery.properties),
      'granularity',
    ]);
    expect(SeriesQuery.properties.granularity).toBe(Granularity);
    expect(SeriesQuery.required).toEqual(['granularity']);
  });

  it('rejects a request without granularity', async () => {
    const res = await get('/v1/projects/kubernetes/series?startDate=2025-06-20');
    expect(res.statusCode).toBe(400);
  });

  it.each(granularities)('accepts granularity=%s with the date range', async (granularity) => {
    const res = await get(
      `/v1/projects/kubernetes/series?startDate=2025-06-20&endDate=2025-09-18&granularity=${granularity}`,
    );
    expect(res.statusCode).toBe(200);
    expect(res.json().query).toEqual({
      startDate: '2025-06-20',
      endDate: '2025-09-18',
      granularity,
    });
  });

  it('shows granularity as a required, described enum in OpenAPI', async () => {
    const operation = await getOperation('/v1/projects/{slug}/series');
    const param = operation.parameters?.find((p) => p.name === 'granularity');
    expect(param?.required).toBe(true);
    expect(param?.schema.enum).toEqual(granularities);
    expect(parameterDescription(param)).toBe(Granularity.description);
  });
});

describe('periodSummary factory (AC6)', () => {
  const counts = periodSummary({
    measure: 'Commits',
    unit: 'count',
    kind: 'integer',
    title: 'CommitSummary',
    description: 'Commit totals for the current period against the previous one.',
  });
  const share = periodSummary({
    measure: 'Share of contributions made outside work hours',
    unit: 'percent',
    changeUnit: 'percentage points',
    kind: 'number',
  });

  it('keeps the six PeriodSummary fields in the same order, all required', () => {
    const fields = [
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
    ];
    expect(Object.keys(counts.properties)).toEqual(fields);
    expect(counts.required).toEqual(fields);
    expect(Object.keys(share.properties)).toEqual(fields);
  });

  it('types the three count fields as integer for kind integer', () => {
    expect(counts.properties.current.type).toBe('integer');
    expect(counts.properties.previous.type).toBe('integer');
    expect(counts.properties.changeValue.type).toBe('integer');
  });

  it('types the three fields as number for kind number', () => {
    expect(share.properties.current.type).toBe('number');
    expect(share.properties.previous.type).toBe('number');
    expect(share.properties.changeValue.type).toBe('number');
  });

  it('describes current, previous and changeValue from the measure and unit', () => {
    expect(counts.properties.current.description).toBe('Commits in the current period (count).');
    expect(counts.properties.previous.description).toBe(
      'Commits in the comparison period, which ends the day before `periodFrom`. Its span is derived in calendar months and days, so its elapsed days can differ from the current period (count).',
    );
    expect(counts.properties.changeValue.description).toBe('`current` minus `previous` (count).');
  });

  it('uses changeUnit for changeValue when given', () => {
    expect(share.properties.current.description).toBe(
      'Share of contributions made outside work hours in the current period (percent).',
    );
    expect(share.properties.previous.description).toMatch(/\(percent\)\.$/);
    expect(share.properties.changeValue.description).toBe(
      '`current` minus `previous` (percentage points).',
    );
  });

  it('reuses the shared percentageChange, periodFrom and periodTo schemas', () => {
    for (const summary of [counts, share]) {
      expect(summary.properties.percentageChange).toBe(PeriodSummary.properties.percentageChange);
      expect(summary.properties.periodFrom).toBe(PeriodSummary.properties.periodFrom);
      expect(summary.properties.periodTo).toBe(PeriodSummary.properties.periodTo);
    }
  });

  it('writes title and description only when given', () => {
    expect(counts.title).toBe('CommitSummary');
    expect(counts.description).toBe(
      'Commit totals for the current period against the previous one.',
    );
    expect(share).not.toHaveProperty('title');
    expect(share).not.toHaveProperty('description');
  });

  it('spreads into a wider object without losing the field schemas', () => {
    const widened = Type.Object(
      { ...counts.properties, extra: Type.Number() },
      { title: 'Widened' },
    );
    expect(Object.keys(widened.properties)).toEqual([
      'current',
      'previous',
      'percentageChange',
      'changeValue',
      'periodFrom',
      'periodTo',
      'extra',
    ]);
    expect(widened.properties.current).toBe(counts.properties.current);
  });
});

// Route lists come from the served spec, so a new development module is checked here without
// anyone adding it to a list; tests/v1-alpha-autoload.test.ts pins the module side.
const alphaApp = await buildApp();
await alphaApp.ready();
const specResponse = await alphaApp.inject({ method: 'GET', url: '/v1-alpha/openapi.json' });
await alphaApp.close();
if (specResponse.statusCode !== 200) {
  throw new Error(
    `/v1-alpha/openapi.json answered ${specResponse.statusCode}: ${specResponse.body}`,
  );
}
const alphaSpec = specResponse.json<OpenApiDoc>();

// Development routes are all GETs. A path without one fails the coverage check below by name
// instead of skipping, which is where this suite gets extended when another method arrives.
const developmentPrefix = '/v1-alpha/projects/{slug}/development/';
const developmentOperations = new Map(
  Object.entries(alphaSpec.paths).flatMap(([path, item]) =>
    path.startsWith(developmentPrefix) && item.get
      ? [[path.slice(developmentPrefix.length), item.get] as const]
      : [],
  ),
);
const developmentRoutes = [...developmentOperations.keys()].sort();
const developmentPaths = Object.keys(alphaSpec.paths)
  .filter((path) => path.startsWith(developmentPrefix))
  .map((path) => path.slice(developmentPrefix.length))
  .sort();

describe('the v1-alpha routes serve the shared wording and types (AC8, decision 4)', () => {
  const operation = (name: string) => {
    const op = developmentOperations.get(name);
    if (!op) throw new Error(`${name} has no GET operation in the spec`);
    return op;
  };
  const parameter = (name: string, param: string) =>
    operation(name).parameters?.find((p) => p.name === param);
  // Swagger may hoist a schema into components and leave a $ref behind; read through it so a
  // route never drops out of the checks unnoticed.
  const resolve = (schema?: OpenApiSchema): OpenApiSchema | undefined => {
    if (!schema?.$ref) return schema;
    const prefix = '#/components/schemas/';
    return schema.$ref.startsWith(prefix)
      ? alphaSpec.components?.schemas?.[schema.$ref.slice(prefix.length)]
      : undefined;
  };
  const responseSchema = (name: string) =>
    resolve(operation(name).responses['200']?.content['application/json']?.schema);

  // Any response property carrying the four PeriodSummary fields is a summary, whatever its name,
  // so routes with several summaries and nullable variants are all covered.
  const summaryFields = ['current', 'previous', 'percentageChange', 'changeValue'];
  const summariesOf = (name: string) => {
    const properties = responseSchema(name)?.properties ?? {};
    return Object.entries(properties)
      .map(([field, schema]) => [field, resolve(schema)] as const)
      .filter((entry): entry is readonly [string, OpenApiSchema] =>
        summaryFields.every((field) => entry[1]?.properties?.[field] !== undefined),
      );
  };

  const seriesRoutes = developmentRoutes.filter((name) => parameter(name, 'granularity'));
  const summaryCases = developmentRoutes.flatMap((name) =>
    summariesOf(name).map(([field, schema]) => [name, field, schema] as const),
  );

  it('discovers the development routes from the spec', () => {
    expect(developmentRoutes.length).toBeGreaterThanOrEqual(5);
    expect(developmentRoutes).toEqual(developmentPaths);
    expect(seriesRoutes.length).toBeGreaterThan(0);
    expect(summaryCases.length).toBeGreaterThan(0);
  });

  it.each(developmentRoutes)('%s serves an object response the checks below can read', (name) => {
    const schema = responseSchema(name);
    expect(schema?.type).toBe('object');
    const properties = Object.entries(schema?.properties ?? {});
    expect(properties.length).toBeGreaterThan(0);
    for (const [field, property] of properties) {
      expect(resolve(property), `${name}.${field} does not resolve`).toBeDefined();
    }
  });

  it.each(developmentRoutes)(
    '%s takes the common range and documents the inclusive start and exclusive end',
    (name) => {
      expect(operation(name).description).toMatch(/00:00 UTC/);
      expect(parameterDescription(parameter(name, 'startDate'))).toMatch(/inclusive/i);
      expect(parameterDescription(parameter(name, 'endDate'))).toMatch(/exclusive/i);
    },
  );

  it.each(seriesRoutes)('%s describes granularity with the shared wording', (name) => {
    const param = parameter(name, 'granularity');
    expect(param?.required).toBe(true);
    expect(param?.schema.enum).toEqual(granularities);
    expect(parameterDescription(param)).toBe(Granularity.description);
  });

  it.each(summaryCases)(
    '%s %s states a unit on every value and keeps percentageChange nullable',
    (name, field, summary) => {
      const kind = summary.properties?.current?.type;
      expect(['integer', 'number'], `${name}.${field}.current`).toContain(kind);
      // The unit sits in parentheses before a period so a nullable note can follow it.
      const unitOf = (value: string) =>
        summary.properties?.[value]?.description?.match(/\(([a-z ]+)\)\./)?.[1];
      const unit = unitOf('current');
      // A count is an integer, so a number-kind summary may name any unit but a count.
      expect(unit ?? '', `${name}.${field}.current`).toMatch(
        kind === 'integer' ? /^count( of [a-z]+)?$/ : /^(?!count)[a-z ]+$/,
      );
      for (const value of ['previous', 'changeValue']) {
        expect(summary.properties?.[value]?.type, `${name}.${field}.${value}`).toBe(kind);
      }
      expect(unitOf('previous'), `${name}.${field}.previous`).toBe(unit);
      expect(unitOf('changeValue'), `${name}.${field}.changeValue`).toBe(
        unit === 'percent' ? 'percentage points' : unit,
      );
      expect(summary.properties?.percentageChange).toMatchObject({
        type: 'number',
        nullable: true,
      });
    },
  );
});
