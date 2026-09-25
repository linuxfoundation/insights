// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import {
  callsTo,
  mockFetch,
  pipeCalls,
  queryString,
  tinybirdStub,
  useApp,
} from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/overview/health-score';
const insightsPath = '/v0/pipes/project_insights.json';
const lifecyclePath = '/v0/pipes/repo_lifecycle_v2.json';
const breakdownPath = '/v0/pipes/repo_health_score_v2_breakdown.json';

const repo = 'https://github.com/kubernetes/kubernetes';
const withRepos = `${route}?${queryString({ repos: repo })}`;

const insightsRow = {
  slug: 'kubernetes',
  name: 'Kubernetes',
  healthScoreV2: 55,
  healthLabel: 'fair',
  lifecycleLabel: 'active',
  impactScore: 90,
  impactLabel: 'foundational',
  maintainerHealthScoreV2: 30,
  securitySupplyChainScoreV2: null,
  developmentActivityScoreV2: 25,
  coveredCategoryCount: 2,
  healthMaxScore: 65,
};

const breakdownRow = {
  healthScoreV2: 80,
  healthLabel: 'healthy',
  maintainerHealthScoreV2: 35,
  securitySupplyChainScoreV2: 25,
  developmentActivityScoreV2: 20,
  busFactorScore: 10,
};

const allNull = {
  score: null,
  healthLabel: null,
  lifecycleLabel: null,
  impactScore: null,
  impactLabel: null,
  maintainerHealthScore: null,
  securitySupplyChainScore: null,
  developmentActivityScore: null,
  coveredCategoryCount: null,
  healthMaxScore: null,
};

let insightsRows: unknown[] = [];
let lifecycleRows: unknown[] = [];
let breakdownRows: unknown[] = [];

const { get } = useApp();

beforeEach(() => {
  insightsRows = [insightsRow];
  lifecycleRows = [{ lifecycleLabel: 'stable' }];
  breakdownRows = [breakdownRow];
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname === insightsPath) return insightsRows;
      if (url.pathname === lifecyclePath) return lifecycleRows;
      if (url.pathname === breakdownPath) return breakdownRows;
      throw new Error(`unexpected Tinybird call to ${url.pathname}`);
    }),
  );
});

describe('Tinybird calls (AC1)', () => {
  it('reads project_insights by slug when no repos are given', async () => {
    expect((await get(route)).statusCode).toBe(200);
    expect(pipeCalls().map((call) => call.pathname)).toEqual([insightsPath]);
    expect(callsTo(insightsPath)[0]?.searchParams.get('slug')).toBe('kubernetes');
    expect(callsTo(insightsPath)[0]?.searchParams.get('bucketId')).toBe('7');
  });

  it('reads the lifecycle and breakdown pipes by slug and repos when repos are given', async () => {
    expect((await get(withRepos)).statusCode).toBe(200);
    expect(
      pipeCalls()
        .map((call) => call.pathname)
        .sort(),
    ).toEqual([breakdownPath, lifecyclePath].sort());
    for (const call of pipeCalls()) {
      expect(call.searchParams.get('slug')).toBe('kubernetes');
      expect(call.searchParams.get('repos')).toBe(repo);
      expect(call.searchParams.get('bucketId')).toBe('7');
    }
  });
});

describe('response mapping (AC2)', () => {
  it('returns the project scores without the V2 suffixes', async () => {
    expect((await get(route)).json()).toEqual({
      score: 55,
      healthLabel: 'fair',
      lifecycleLabel: 'active',
      impactScore: 90,
      impactLabel: 'foundational',
      maintainerHealthScore: 30,
      securitySupplyChainScore: null,
      developmentActivityScore: 25,
      coveredCategoryCount: 2,
      healthMaxScore: 65,
    });
  });

  it('keeps the category scores when the score is null', async () => {
    insightsRows = [
      {
        ...insightsRow,
        healthScoreV2: null,
        healthLabel: null,
        lifecycleLabel: 'archived',
        coveredCategoryCount: null,
        healthMaxScore: null,
      },
    ];
    const body = (await get(route)).json();
    expect(body.score).toBeNull();
    expect(body.lifecycleLabel).toBe('archived');
    expect(body.maintainerHealthScore).toBe(30);
    expect(body.developmentActivityScore).toBe(25);
  });
});

describe('repo-filtered answer (AC3)', () => {
  it('combines the breakdown and lifecycle rows and nulls the project-only fields', async () => {
    expect((await get(withRepos)).json()).toEqual({
      score: 80,
      healthLabel: 'healthy',
      lifecycleLabel: 'stable',
      impactScore: null,
      impactLabel: null,
      maintainerHealthScore: 35,
      securitySupplyChainScore: 25,
      developmentActivityScore: 20,
      coveredCategoryCount: null,
      healthMaxScore: null,
    });
  });
});

describe('empty answers (AC4)', () => {
  it('answers every field null when project_insights has no row', async () => {
    insightsRows = [];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(allNull);
  });

  it('answers every field null for an unknown project without calling the pipes', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [insightsRow], []));
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(allNull);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('answers every field null for an unknown project with repos without calling the pipes', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => [breakdownRow], []));
    const res = await get(withRepos);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(allNull);
    expect(pipeCalls()).toHaveLength(0);
  });

  it('keeps the lifecycle label when the breakdown has no row', async () => {
    breakdownRows = [];
    expect((await get(withRepos)).json()).toEqual({ ...allNull, lifecycleLabel: 'stable' });
  });

  it('answers every field null when both repo pipes return no row', async () => {
    breakdownRows = [];
    lifecycleRows = [];
    expect((await get(withRepos)).json()).toEqual(allNull);
  });
});

describe('row guard (AC5)', () => {
  it.each([
    ['a score above 100', { healthScoreV2: 101 }],
    ['a negative score', { healthScoreV2: -1 }],
    ['a fractional score', { healthScoreV2: 50.5 }],
    ['a string score', { healthScoreV2: '50' }],
    ['a missing score', { healthScoreV2: undefined }],
    ['a maintainer score above 40', { maintainerHealthScoreV2: 41 }],
    ['a security score above 35', { securitySupplyChainScoreV2: 36 }],
    ['a development score above 25', { developmentActivityScoreV2: 26 }],
    ['an impact score above 100', { impactScore: 101 }],
    ['an unknown health label', { healthLabel: 'Fair' }],
    ['an unknown lifecycle label', { lifecycleLabel: 'dormant' }],
    ['an unknown impact label', { impactLabel: 'significant' }],
    ['a covered category count above 3', { coveredCategoryCount: 4 }],
    ['a max score above 100', { healthMaxScore: 120 }],
    ['a max score outside the derived maxima', { healthMaxScore: 70 }],
    ['a score above the max score', { healthScoreV2: 66 }],
  ])('answers 503 for a project row with %s', async (_label, patch) => {
    insightsRows = [{ ...insightsRow, ...patch }];
    expect((await get(route)).statusCode).toBe(503);
  });

  it.each([
    ['a score above 100', { healthScoreV2: 101 }],
    ['an unknown health label', { healthLabel: 'good' }],
    ['a maintainer score above 40', { maintainerHealthScoreV2: 41 }],
  ])('answers 503 for a breakdown row with %s', async (_label, patch) => {
    breakdownRows = [{ ...breakdownRow, ...patch }];
    expect((await get(withRepos)).statusCode).toBe(503);
  });

  it('answers 503 for a lifecycle row with an unknown label', async () => {
    lifecycleRows = [{ lifecycleLabel: 'dormant' }];
    expect((await get(withRepos)).statusCode).toBe(503);
  });
});
