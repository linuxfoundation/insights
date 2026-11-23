// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mockFetch,
  pipeCalls,
  resolveSchema,
  tinybirdError,
  tinybirdStub,
  useApp,
  type OpenApiDoc,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects';
const pipePath = '/v0/pipes/projects_list.json';
const cursorFor = (offset: number) => Buffer.from(String(offset)).toString('base64url');

const repoUrl = (index: number) => `https://github.com/org/project-${index}`;

const row = (index: number) => ({
  id: `id-${index}`,
  name: `Project ${index}`,
  slug: `project-${index}`,
  sourceId: `a0941000002w${index}`,
  description: `Project ${index} description`,
  logo: `https://example.org/${index}.png`,
  isLF: 1,
  contributorCount: 100,
  organizationCount: 10,
  repositories: [repoUrl(index)],
  archivedRepositories: [],
  excludedRepositories: [],
  connectedPlatforms: ['github-nango', 'git'],
  repoData: [[repoUrl(index), '0.5', '12']],
  repoLicenses: [[repoUrl(index), 'Apache-2.0']],
  keywords: ['tag'],
  website: 'https://example.org',
  github: 'https://github.com/org',
  linkedin: '',
  twitter: '',
  softwareValue: '2000',
  maturity: 'Incubating',
  widgets: ['commitActivities'],
  status: 'active',
});

// Reads the pipe params from the query string and, for a POST, from the form body.
function sentParams(input: unknown, init?: RequestInit): URLSearchParams {
  const params = new URL(String(input)).searchParams;
  for (const [key, value] of new URLSearchParams(String(init?.body ?? ''))) {
    params.append(key, value);
  }
  return params;
}

const listCalls = () =>
  mockFetch.mock.calls
    .filter(([input]) => new URL(String(input)).pathname === pipePath)
    .map(([input, init]) => sentParams(input, init as RequestInit | undefined));

// The pipe pages by row: `limit` rows from `offset`.
let all: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  all = Array.from({ length: 60 }, (_, index) => row(index + 1));
  mockFetch.mockImplementation(
    tinybirdStub((url, init) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      const params = sentParams(url, init);
      const start = Number(params.get('offset') ?? 0);
      return all.slice(start, start + Number(params.get('limit')));
    }),
  );
});

interface Body {
  data: { slug: string; sourceId: string | null }[];
  pageSize: number;
  nextCursor: string | null;
}

async function getPage(url: string): Promise<Body> {
  const res = await get(url);
  expect(res.statusCode).toBe(200);
  return res.json<Body>();
}

describe('GET /v1-alpha/projects pagination (AC4.1, AC4.2)', () => {
  it('returns the first 50 projects by default and asks the pipe for one row more, sorted by name', async () => {
    const body = await getPage(route);

    expect(body.data).toHaveLength(50);
    expect(body.data[0]?.slug).toBe('project-1');
    expect(body.pageSize).toBe(50);
    expect(body.nextCursor).toBe(cursorFor(50));
    const [params] = listCalls();
    expect(listCalls()).toHaveLength(1);
    expect(params?.get('limit')).toBe('51');
    expect(params?.get('offset')).toBe('0');
    expect(params?.get('orderByField')).toBe('name');
    expect(params?.get('orderByDirection')).toBe('asc');
  });

  it('continues from the cursor and ends with a null cursor on the last page', async () => {
    const body = await getPage(`${route}?cursor=${cursorFor(50)}`);

    expect(body.data.map((project) => project.slug)).toEqual(
      Array.from({ length: 10 }, (_, index) => `project-${index + 51}`),
    );
    expect(body.nextCursor).toBeNull();
    expect(listCalls()[0]?.get('offset')).toBe('50');
  });

  it('keeps the cursor position when pageSize changes', async () => {
    const body = await getPage(`${route}?cursor=${cursorFor(2)}&pageSize=3`);

    expect(body.data.map((project) => project.slug)).toEqual([
      'project-3',
      'project-4',
      'project-5',
    ]);
    expect(body.pageSize).toBe(3);
    expect(body.nextCursor).toBe(cursorFor(5));
    expect(listCalls()[0]?.get('limit')).toBe('4');
  });

  it('sets nextCursor only when the extra row came back', async () => {
    all = all.slice(0, 3);
    const exact = await getPage(`${route}?pageSize=3`);
    expect(exact.nextCursor).toBeNull();

    all = Array.from({ length: 4 }, (_, index) => row(index + 1));
    const more = await getPage(`${route}?pageSize=3`);
    expect(more.data).toHaveLength(3);
    expect(more.nextCursor).toBe(cursorFor(3));
  });

  it('returns projects in the order the pipe sends them', async () => {
    all = [row(9), row(2), row(5)];
    const body = await getPage(route);

    expect(body.data.map((project) => project.slug)).toEqual([
      'project-9',
      'project-2',
      'project-5',
    ]);
  });

  it('returns an empty page when there are no projects', async () => {
    all = [];

    expect(await getPage(route)).toEqual({ data: [], pageSize: 50, nextCursor: null });
  });

  it.each(['not-a-cursor!', Buffer.from('-1').toString('base64url'), 'MTA'.concat('=')])(
    'answers 400 invalid_request for the cursor %s without calling the pipe',
    async (cursor) => {
      const res = await get(`${route}?cursor=${encodeURIComponent(cursor)}`);

      expect(res.statusCode).toBe(400);
      expect(res.json().code).toBe('invalid_request');
      expect(pipeCalls()).toHaveLength(0);
    },
  );

  it.each(['0', '201'])('answers 400 for pageSize=%s', async (pageSize) => {
    const res = await get(`${route}?pageSize=${pageSize}`);

    expect(res.statusCode).toBe(400);
    expect(pipeCalls()).toHaveLength(0);
  });
});

describe('search (D1)', () => {
  it('passes search to the pipe', async () => {
    await getPage(`${route}?search=kube`);

    expect(listCalls()[0]?.get('search')).toBe('kube');
  });

  it('sends no search when the request has none', async () => {
    await getPage(route);

    expect(listCalls()[0]?.has('search')).toBe(false);
  });
});

describe('project fields (AC4.3)', () => {
  it('maps each row as GET /v1-alpha/projects/{slug} does, plus sourceId', async () => {
    all = [row(1)];

    expect((await getPage(route)).data).toEqual([
      {
        slug: 'project-1',
        name: 'Project 1',
        sourceId: 'a0941000002w1',
        description: 'Project 1 description',
        logoUrl: 'https://example.org/1.png',
        softwareValue: 2000,
        tags: ['tag'],
        maturity: 'Incubating',
        links: {
          website: 'https://example.org',
          linkedin: null,
          github: 'https://github.com/org',
          twitter: null,
        },
        repositories: [
          {
            url: repoUrl(1),
            name: 'org/project-1',
            score: 0.5,
            rank: 12,
            licenses: ['Apache-2.0'],
            archived: false,
            excluded: false,
          },
        ],
        connectedPlatforms: ['github', 'git'],
      },
    ]);
  });

  it('answers null sourceId for a project without an LFX identifier', async () => {
    const { sourceId: _s, ...withoutSourceId } = row(2);
    all = [{ ...row(1), sourceId: '' }, withoutSourceId];
    const body = await getPage(route);

    expect(body.data.map((project) => project.sourceId)).toEqual([null, null]);
  });
});

describe('Tinybird failures (AC4.6)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a Tinybird 500 to 503 upstream_unavailable', async () => {
    mockFetch.mockImplementation(async () => tinybirdError(500));
    const res = await get(route);

    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
  });
});

describe('spec (AC4.5)', () => {
  async function operation() {
    const doc = (await get('/v1-alpha/openapi.json')).json<OpenApiDoc>();
    return { doc, op: doc.paths[route]?.get };
  }

  it('documents the route under the Projects tag with its query parameters', async () => {
    const { op } = await operation();

    expect(op?.tags).toEqual(['Projects']);
    expect(op?.summary).toBeTruthy();
    expect(op?.description).toBeTruthy();
    const params = Object.fromEntries((op?.parameters ?? []).map((p) => [p.name, p]));
    expect(Object.keys(params).sort()).toEqual(['cursor', 'pageSize', 'search']);
    for (const param of Object.values(params)) {
      expect(param.in).toBe('query');
      expect(param.required ?? false).toBe(false);
      expect(param.description, param.name).toBeTruthy();
    }
  });

  it('documents a paginated response whose items carry a nullable sourceId', async () => {
    const { doc, op } = await operation();
    const schema = resolveSchema(doc, op?.responses['200']?.content['application/json']?.schema);

    expect(schema?.required).toEqual(expect.arrayContaining(['data', 'pageSize', 'nextCursor']));
    const item = resolveSchema(doc, resolveSchema(doc, schema?.properties?.data)?.items);
    const sourceId = resolveSchema(doc, item?.properties?.sourceId);
    expect(item?.required).toEqual(expect.arrayContaining(['slug', 'name', 'sourceId']));
    expect(sourceId?.nullable).toBe(true);
    expect(sourceId?.description).toBeTruthy();
  });

  it('keeps the route out of /v1', async () => {
    const v1 = (await get('/v1/openapi.json')).json<OpenApiDoc>();

    expect(Object.keys(v1.paths)).not.toContain('/v1/projects');
    expect((await get('/v1/projects')).statusCode).toBe(404);
  });

  it('sets Cache-Control: private, max-age=0', async () => {
    const res = await get(route);

    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('private, max-age=0');
  });
});
