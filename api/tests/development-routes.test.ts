// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import {
  bucketsPath,
  callsTo,
  developmentPath,
  mockFetch,
  parameterDescription,
  pipeCalls,
  queryString,
  tinybirdError,
  tinybirdResponse,
  tinybirdStub,
  responseFields,
  useApp,
  type OpenApiDoc,
  type OpenApiSchema,
} from './helpers/tinybird.js';

// Cases every Development route shares through fetchPipe, withBucket, the date schemas and the
// alpha plugin. Route files keep only what is specific to their route.
const discovery = await buildApp();
await discovery.ready();
const spec = (
  await discovery.inject({ method: 'GET', url: '/v1-alpha/openapi.json' })
).json<OpenApiDoc>();
await discovery.close();

const prefix = developmentPath('');
const routes = Object.entries(spec.paths).flatMap(([path, item]) =>
  path.startsWith(prefix) && item.get
    ? [{ name: path.slice(prefix.length), operation: item.get }]
    : [],
);
const names = routes.map((route) => route.name).sort();
const operationOf = (name: string) => routes.find((route) => route.name === name)!.operation;
const hasGranularity = (name: string) =>
  operationOf(name).parameters?.some((param) => param.name === 'granularity') ?? false;

const knownRequired = new Set(['slug', 'granularity']);
const validQuery = (name: string) => ({
  startDate: '2025-01-01',
  endDate: '2025-03-31',
  ...(hasGranularity(name) ? { granularity: 'monthly' } : {}),
});
const url = (name: string, params: Record<string, string | undefined> = {}, slug = 'kubernetes') =>
  `/v1-alpha/projects/${slug}/development/${name}?${queryString({ ...validQuery(name), ...params })}`;

const { get } = useApp();
const emptyRows = tinybirdStub(() => []);

describe('route discovery', () => {
  it('finds the development routes and knows how to call each', () => {
    expect(names.length).toBeGreaterThanOrEqual(14);
    for (const name of names) {
      const required = operationOf(name)
        .parameters?.filter((param) => param.required)
        .map((param) => param.name);
      for (const param of required ?? []) {
        expect(knownRequired, `${name} requires ${param}; teach validQuery about it`).toContain(
          param,
        );
      }
    }
  });
});

describe.each(names)('%s', (name) => {
  it('answers 200 with Cache-Control: private, max-age=0', async () => {
    mockFetch.mockImplementation(emptyRows);
    const res = await get(url(name));
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });

  it('issues its pipe calls concurrently', async () => {
    mockFetch.mockImplementation(emptyRows);
    await get(url(name));
    const expected = pipeCalls().length;
    expect(expected).toBeGreaterThan(0);

    let inFlight = 0;
    let maxInFlight = 0;
    mockFetch.mockReset().mockImplementation(
      tinybirdStub(async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
        return [];
      }),
    );
    expect((await get(url(name))).statusCode).toBe(200);
    expect(maxInFlight).toBe(expected);
  });

  it('answers an unknown project after the bucket lookup alone', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(tinybirdStub(() => [], []));
    const res = await get(url(name, {}, 'no-such-project'));
    expect(res.statusCode).toBe(200);
    expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('no-such-project');
    expect(pipeCalls()).toHaveLength(0);
    vi.restoreAllMocks();
  });

  it('looks the bucket up once and forwards it, 0 included, on every pipe call', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [], [{ bucketId: 0 }]));
    expect((await get(url(name))).statusCode).toBe(200);
    expect(callsTo(bucketsPath)).toHaveLength(1);
    expect(callsTo(bucketsPath)[0]?.searchParams.get('project')).toBe('kubernetes');
    expect(pipeCalls().length).toBeGreaterThan(0);
    for (const call of pipeCalls()) {
      expect(call.searchParams.get('bucketId'), call.pathname).toBe('0');
    }
  });

  describe('upstream failures answer 503 upstream_unavailable with the header set', () => {
    const cases: [string, () => void][] = [
      ['a failing bucket lookup', () => mockFetch.mockResolvedValue(tinybirdError(500))],
      [
        'a bucket lookup network error',
        () => mockFetch.mockRejectedValue(new TypeError('fetch failed')),
      ],
      [
        'a pipe network error',
        () =>
          mockFetch.mockImplementation(
            tinybirdStub(() => {
              throw new TypeError('fetch failed: tinybird internal detail');
            }),
          ),
      ],
      [
        'a pipe body that is not JSON',
        () =>
          mockFetch.mockImplementation(
            tinybirdStub(
              () => new Response('<html>tinybird internal detail</html>', { status: 200 }),
            ),
          ),
      ],
      [
        'a pipe body whose data is not an array',
        () =>
          mockFetch.mockImplementation(
            tinybirdStub(
              () =>
                new Response(JSON.stringify({ data: 'tinybird internal detail' }), {
                  status: 200,
                }),
            ),
          ),
      ],
    ];

    it.each(cases)('%s', async (_label, arrange) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      arrange();
      const res = await get(url(name));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain('tinybird internal detail');
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      vi.restoreAllMocks();
    });

    // The empty answer for an unknown project comes from the bucket lookup, so a pipe 404 is an
    // outage like any other status.
    it.each([500, 404, 401, 429])('a pipe %i, without echoing the status', async (status) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockImplementation(tinybirdStub(() => tinybirdError(status)));
      const res = await get(url(name));
      expect(res.statusCode).toBe(503);
      expect(res.json().code).toBe('upstream_unavailable');
      expect(res.body).not.toContain(String(status));
      expect(res.body).not.toContain('tinybird internal detail');
      expect(res.headers['cache-control']).toBe('private, max-age=0');
      vi.restoreAllMocks();
    });

    // Keyed by URL so the client's retries of the failing call fail too.
    it('answers 503 when any one pipe call fails and the rest succeed', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockImplementation(emptyRows);
      await get(url(name));
      const calls = [...new Set(pipeCalls().map((call) => `${call.pathname}${call.search}`))];
      expect(calls.length).toBeGreaterThan(0);
      for (const failing of calls) {
        mockFetch
          .mockReset()
          .mockImplementation(
            tinybirdStub((call) =>
              `${call.pathname}${call.search}` === failing ? tinybirdError(500) : [],
            ),
          );
        expect((await get(url(name))).statusCode, failing).toBe(503);
      }
      vi.restoreAllMocks();
    });

    it('calls no pipe when the bucket lookup fails', async () => {
      mockFetch.mockImplementation(async (input: unknown) =>
        new URL(String(input)).pathname === bucketsPath ? tinybirdError(500) : tinybirdResponse([]),
      );
      expect((await get(url(name))).statusCode).toBe(503);
      expect(pipeCalls()).toHaveLength(0);
    });
  });

  describe('repos', () => {
    const repo = 'https://github.com/kubernetes/kubernetes';
    const other = 'https://github.com/kubernetes/website';
    const reposOnEveryCall = async (query: string) => {
      mockFetch.mockReset().mockImplementation(emptyRows);
      expect((await get(`${url(name)}&${query}`)).statusCode).toBe(200);
      expect(pipeCalls().length).toBeGreaterThan(0);
      return pipeCalls().map((call) => call.searchParams.get('repos'));
    };

    it('sends every repos value on every pipe call', async () => {
      const sent = await reposOnEveryCall(queryString({ repos: [repo, other] }));
      expect(new Set(sent)).toEqual(new Set([`${repo},${other}`]));
    });

    it('drops an empty repos value and keeps the rest', async () => {
      expect(new Set(await reposOnEveryCall('repos='))).toEqual(new Set([null]));
      const sent = await reposOnEveryCall(queryString({ repos: ['', repo] }));
      expect(new Set(sent)).toEqual(new Set([repo]));
    });

    it('sends no repos when the caller sends none', async () => {
      expect(new Set(await reposOnEveryCall(''))).toEqual(new Set([null]));
    });
  });

  describe('rejects a bad query with 400 before calling Tinybird', () => {
    const cases: [string, Record<string, string | undefined>][] = [
      ['a timestamp in startDate', { startDate: '2025-01-01T00:00:00Z' }],
      ['an endDate that is not a date', { endDate: 'yesterday' }],
      ['an inverted range', { startDate: '2025-03-31', endDate: '2025-01-01' }],
      ...(hasGranularity(name)
        ? ([
            ['a missing granularity', { granularity: undefined }],
            ['granularity=hourly', { granularity: 'hourly' }],
          ] as [string, Record<string, string | undefined>][])
        : []),
    ];

    it.each(cases)('%s', async (_label, params) => {
      const res = await get(url(name, params));
      expect(res.statusCode).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('answers an inverted range with code invalid_request', async () => {
      const res = await get(url(name, { startDate: '2025-03-31', endDate: '2025-01-01' }));
      expect(res.json().code).toBe('invalid_request');
    });
  });

  describe('OpenAPI', () => {
    it('is tagged Development, with a summary and a description', () => {
      const operation = operationOf(name);
      expect(operation.tags).toEqual(['Development']);
      expect(operation.summary).toBeTruthy();
      expect(operation.description).toBeTruthy();
    });

    it('publishes startDate and endDate as optional calendar days', () => {
      for (const param of ['startDate', 'endDate']) {
        const found = operationOf(name).parameters?.find((p) => p.name === param);
        expect(found?.required, param).toBeFalsy();
        expect(found?.schema, param).toMatchObject({ type: 'string', format: 'date' });
      }
    });

    it('describes every query parameter, and describes and requires every response field', () => {
      const query = operationOf(name).parameters?.filter((param) => param.in === 'query');
      for (const param of query ?? []) {
        expect(parameterDescription(param), `parameter ${param.name}`).toBeTruthy();
      }
      const schema = operationOf(name).responses['200']?.content['application/json']?.schema;
      const fields = responseFields(spec, schema);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields.filter((field) => !field.described).map((field) => field.path)).toEqual([]);
      expect(fields.filter((field) => !field.required).map((field) => field.path)).toEqual([]);
    });

    it('stays out of /v1', async () => {
      const v1 = (await get('/v1/openapi.json')).json<OpenApiDoc>();
      expect(Object.keys(v1.paths)).not.toContain(`/v1/projects/{slug}/development/${name}`);
      const res = await get(url(name).replace('/v1-alpha/', '/v1/'));
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('responseFields', () => {
  const doc: OpenApiDoc = {
    paths: {},
    components: {
      schemas: {
        Described: { type: 'object', description: 'Described in components.' },
        Bare: { type: 'object' },
        Buckets: {
          type: 'array',
          description: 'Buckets.',
          items: {
            type: 'object',
            required: ['day'],
            properties: { day: { type: 'string' } },
          },
        },
      },
    },
  };
  const paths = (schema: OpenApiSchema, flag: 'required' | 'described') =>
    responseFields(doc, schema)
      .filter((field) => !field[flag])
      .map((field) => field.path);

  it('reads a property description through a bare $ref', () => {
    const schema = {
      required: ['summary'],
      properties: { summary: { $ref: '#/components/schemas/Described' } },
    };
    expect(paths(schema, 'described')).toEqual([]);
  });

  it('flags a $ref property whose target has no description', () => {
    const schema = {
      required: ['summary'],
      properties: { summary: { $ref: '#/components/schemas/Bare' } },
    };
    expect(paths(schema, 'described')).toEqual(['summary']);
  });

  it('walks the items of an array behind a $ref', () => {
    const schema = {
      required: ['data'],
      properties: { data: { $ref: '#/components/schemas/Buckets' } },
    };
    expect(paths(schema, 'described')).toEqual(['data[].day']);
    expect(paths(schema, 'required')).toEqual([]);
  });

  it('flags a property its parent does not require, at any depth', () => {
    const schema = {
      properties: {
        summary: { description: 'x', properties: { current: { description: 'y' } } },
      },
    };
    expect(paths(schema, 'required')).toEqual(['summary', 'summary.current']);
  });
});
