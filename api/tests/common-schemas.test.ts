// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { getPreviousDates, toPeriodSummary } from '../src/lib/period.js';
import {
  DateRangeQuery,
  Granularity,
  PeriodSummary,
  ProjectSlugParams,
} from '../src/schemas/common.js';
import type { ApiVersion } from '../src/versions/registry.js';

interface OpenApiSchema {
  type?: string;
  enum?: string[];
  format?: string;
  nullable?: boolean;
  title?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
}

interface OpenApiOperation {
  parameters?: { name: string; in: string; schema: OpenApiSchema }[];
  responses: Record<string, { content: Record<string, { schema: OpenApiSchema }> }>;
}

interface OpenApiDoc {
  paths: Record<string, { get: OpenApiOperation }>;
}

const granularities = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

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
