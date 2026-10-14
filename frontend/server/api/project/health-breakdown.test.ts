// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { H3Event } from 'h3';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const mockFetchFromTinybird = vi.fn();
const mockGetQuery = vi.fn();

vi.mock('~~/server/data/tinybird/tinybird', () => ({
  fetchFromTinybird: (...args: unknown[]) => mockFetchFromTinybird(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
global.createError = vi.fn((error) => error);
global.getQuery = mockGetQuery;

type Row = Record<string, unknown> & { slug: string };
type Handler = (event: H3Event) => Promise<{ data: Row[] }>;

let handler: Handler;

beforeAll(async () => {
  handler = (await import('./index')).default as unknown as Handler;
});

const BREAKDOWN_FIELDS = [
  'maintainerHealthScoreV2',
  'securitySupplyChainScoreV2',
  'developmentActivityScoreV2',
  'coveredCategoryCount',
];

const projectRow = (slug: string) => ({ id: `id-${slug}`, slug, name: slug, isLF: 1 });

const healthScoreRow = {
  id: 'hs-id',
  slug: 'k8s',
  segmentId: 'seg',
  widgets: ['w1'],
  overall: 86,
  contributors: 90,
  popularity: 100,
  development: 76,
  security: 79,
};

let projectRows: ReturnType<typeof projectRow>[] = [];
let insightsRows: Record<string, unknown>[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  projectRows = [projectRow('k8s')];
  insightsRows = [];
  mockFetchFromTinybird.mockImplementation((path: string, params: Record<string, unknown>) => {
    if (path === '/v0/pipes/projects_list.json') {
      return Promise.resolve({
        data: params.count === true ? [{ 'count(id)': projectRows.length }] : projectRows,
      });
    }
    if (path === '/v0/pipes/health_score_overview.json') {
      return Promise.resolve({ data: [healthScoreRow] });
    }
    if (path === '/v0/pipes/project_insights.json') {
      return Promise.resolve({ data: insightsRows });
    }
    return Promise.reject(new Error(`unexpected path ${path}`));
  });
});

const calledPaths = () => mockFetchFromTinybird.mock.calls.map((call) => call[0]);

describe('GET /api/project healthBreakdown flag', () => {
  it('makes no project_insights call and adds no fields without the flag', async () => {
    mockGetQuery.mockReturnValue({ slugs: ['k8s'] });

    const res = await handler({} as H3Event);

    expect(calledPaths()).toEqual(['/v0/pipes/projects_list.json', '/v0/pipes/projects_list.json']);
    for (const field of BREAKDOWN_FIELDS) {
      expect(res.data[0]).not.toHaveProperty(field);
    }
  });

  it('fetches every returned slug in one call and attaches the fields by slug', async () => {
    const slugs = Array.from({ length: 12 }, (_, i) => `p${i + 1}`);
    projectRows = slugs.map(projectRow);
    insightsRows = [...slugs].reverse().map((slug, i) => ({
      slug,
      maintainerHealthScoreV2: 40 - i,
      securitySupplyChainScoreV2: 35 - i,
      developmentActivityScoreV2: 25 - i,
      coveredCategoryCount: 3,
    }));
    mockGetQuery.mockReturnValue({ slugs, pageSize: '50', healthBreakdown: 'true' });

    const res = await handler({} as H3Event);

    const insightsCalls = mockFetchFromTinybird.mock.calls.filter(
      (call) => call[0] === '/v0/pipes/project_insights.json',
    );
    expect(insightsCalls).toEqual([['/v0/pipes/project_insights.json', { slugs, pageSize: 12 }]]);
    expect(res.data).toHaveLength(12);
    for (const row of res.data) {
      const expected = insightsRows.find((i) => i.slug === row.slug);
      expect(row).toMatchObject({
        maintainerHealthScoreV2: expected?.maintainerHealthScoreV2,
        securitySupplyChainScoreV2: expected?.securitySupplyChainScoreV2,
        developmentActivityScoreV2: expected?.developmentActivityScoreV2,
        coveredCategoryCount: 3,
      });
    }
  });

  it('fetches the slugs projects_list returned, not the requested slugs', async () => {
    projectRows = ['a', 'c'].map(projectRow);
    mockGetQuery.mockReturnValue({ slugs: ['a', 'b', 'c'], healthBreakdown: 'true' });

    await handler({} as H3Event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith('/v0/pipes/project_insights.json', {
      slugs: ['a', 'c'],
      pageSize: 2,
    });
  });

  it('returns null for missing projects and passes null and 0 scores through', async () => {
    projectRows = ['k8s', 'partial', 'zero', 'unscored', 'missing'].map(projectRow);
    insightsRows = [
      {
        slug: 'k8s',
        maintainerHealthScoreV2: 31,
        securitySupplyChainScoreV2: 25,
        developmentActivityScoreV2: 15,
        coveredCategoryCount: 3,
      },
      {
        slug: 'partial',
        maintainerHealthScoreV2: 40,
        securitySupplyChainScoreV2: null,
        developmentActivityScoreV2: 19,
        coveredCategoryCount: 2,
      },
      {
        slug: 'zero',
        maintainerHealthScoreV2: 0,
        securitySupplyChainScoreV2: 12,
        developmentActivityScoreV2: 0,
        coveredCategoryCount: 3,
      },
      {
        slug: 'unscored',
        maintainerHealthScoreV2: null,
        securitySupplyChainScoreV2: null,
        developmentActivityScoreV2: null,
        coveredCategoryCount: 0,
      },
    ];
    mockGetQuery.mockReturnValue({ healthBreakdown: 'true' });

    const res = await handler({} as H3Event);
    const bySlug = Object.fromEntries(res.data.map((row) => [row.slug, row]));

    expect(mockFetchFromTinybird).toHaveBeenCalledWith('/v0/pipes/project_insights.json', {
      slugs: ['k8s', 'partial', 'zero', 'unscored', 'missing'],
      pageSize: 5,
    });
    expect(bySlug.partial).toMatchObject({
      maintainerHealthScoreV2: 40,
      securitySupplyChainScoreV2: null,
      developmentActivityScoreV2: 19,
      coveredCategoryCount: 2,
    });
    expect(bySlug.zero).toMatchObject({
      maintainerHealthScoreV2: 0,
      securitySupplyChainScoreV2: 12,
      developmentActivityScoreV2: 0,
      coveredCategoryCount: 3,
    });
    expect(bySlug.unscored).toMatchObject({
      maintainerHealthScoreV2: null,
      securitySupplyChainScoreV2: null,
      developmentActivityScoreV2: null,
      coveredCategoryCount: 0,
    });
    for (const field of BREAKDOWN_FIELDS) {
      expect(bySlug.missing).toHaveProperty(field, null);
    }
  });

  it('passes category scores through when coveredCategoryCount is null (archived shape)', async () => {
    projectRows = [projectRow('archived')];
    insightsRows = [
      {
        slug: 'archived',
        maintainerHealthScoreV2: 20,
        securitySupplyChainScoreV2: 24,
        developmentActivityScoreV2: 8,
        coveredCategoryCount: null,
      },
    ];
    mockGetQuery.mockReturnValue({ slugs: ['archived'], healthBreakdown: 'true' });

    const res = await handler({} as H3Event);

    expect(res.data[0]).toMatchObject({
      maintainerHealthScoreV2: 20,
      securitySupplyChainScoreV2: 24,
      developmentActivityScoreV2: 8,
      coveredCategoryCount: null,
    });
  });

  it('skips project_insights on an empty page', async () => {
    projectRows = [];
    mockGetQuery.mockReturnValue({ slugs: ['nope'], healthBreakdown: 'true' });

    const res = await handler({} as H3Event);

    expect(calledPaths()).not.toContain('/v0/pipes/project_insights.json');
    expect(res).toEqual({ page: 0, pageSize: 10, total: 0, data: [] });
  });

  it('responds 500 when project_insights fails', async () => {
    const defaultImpl = mockFetchFromTinybird.getMockImplementation();
    mockFetchFromTinybird.mockImplementation((path: string, params: Record<string, unknown>) =>
      path === '/v0/pipes/project_insights.json'
        ? Promise.reject(new Error('tinybird down'))
        : defaultImpl?.(path, params),
    );
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetQuery.mockReturnValue({ slugs: ['k8s'], healthBreakdown: 'true' });

    await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 500 });
    consoleError.mockRestore();
  });

  it('rejects pageSize over 100 with the flag before calling Tinybird', async () => {
    mockGetQuery.mockReturnValue({ healthBreakdown: 'true', pageSize: '101' });

    await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 400 });
    expect(mockFetchFromTinybird).not.toHaveBeenCalled();
  });

  it('allows pageSize over 100 without the flag and 100 with it', async () => {
    mockGetQuery.mockReturnValue({ pageSize: '101' });
    await expect(handler({} as H3Event)).resolves.toMatchObject({ pageSize: 101 });
    expect(mockFetchFromTinybird).toHaveBeenCalledWith(
      '/v0/pipes/projects_list.json',
      expect.objectContaining({ pageSize: 101 }),
    );

    mockFetchFromTinybird.mockClear();
    mockGetQuery.mockReturnValue({ healthBreakdown: 'true', pageSize: '100' });
    await expect(handler({} as H3Event)).resolves.toMatchObject({ pageSize: 100 });
    expect(calledPaths()).toContain('/v0/pipes/project_insights.json');
  });

  it('keeps the healthScore flag unchanged, alone and together with healthBreakdown', async () => {
    insightsRows = [
      {
        slug: 'k8s',
        maintainerHealthScoreV2: 31,
        securitySupplyChainScoreV2: 25,
        developmentActivityScoreV2: 15,
        coveredCategoryCount: 3,
      },
    ];

    mockGetQuery.mockReturnValue({ slugs: ['k8s'], healthScore: 'true' });
    const alone = await handler({} as H3Event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith('/v0/pipes/health_score_overview.json', {
      slugs: ['k8s'],
    });
    expect(calledPaths()).not.toContain('/v0/pipes/project_insights.json');
    expect(alone.data[0]?.healthScore).toStrictEqual({
      overall: 86,
      contributors: 90,
      popularity: 100,
      development: 76,
      security: 79,
      widgets: undefined,
      id: undefined,
      segmentId: undefined,
      slug: undefined,
    });
    for (const field of BREAKDOWN_FIELDS) {
      expect(alone.data[0]).not.toHaveProperty(field);
    }

    mockFetchFromTinybird.mockClear();
    mockGetQuery.mockReturnValue({ slugs: ['k8s'], healthScore: 'true', healthBreakdown: 'true' });
    const both = await handler({} as H3Event);

    expect(mockFetchFromTinybird).toHaveBeenCalledWith('/v0/pipes/health_score_overview.json', {
      slugs: ['k8s'],
    });
    expect(both.data[0]?.healthScore).toStrictEqual(alone.data[0]?.healthScore);
    expect(both.data[0]).toMatchObject({
      maintainerHealthScoreV2: 31,
      securitySupplyChainScoreV2: 25,
      developmentActivityScoreV2: 15,
      coveredCategoryCount: 3,
    });
  });
});
