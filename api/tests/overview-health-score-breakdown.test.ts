// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callsTo, mockFetch, pipeCalls, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/overview/health-score/breakdown';
const projectPipe = '/v0/pipes/project_insights_health_breakdown.json';
const repoPipe = '/v0/pipes/repo_health_score_v2_breakdown.json';

const repo = 'https://github.com/kubernetes/kubernetes';
const other = 'https://github.com/kubernetes/website';

const pipeRow = {
  projectId: 'project-id',
  slug: 'kubernetes',
  busFactorScore: 12,
  busFactorAvailable: 1,
  busFactorCount: 4,
  orgDiversityScore: 7,
  orgDiversityAvailable: 1,
  orgCount: 26,
  responsivenessScore: 10,
  responsivenessAvailable: 1,
  medianPrResponseS: 3600,
  medianIssueResponseS: 7200.5,
  isGerrit: 0,
  isExcluded: 0,
  openVulnScore: 4,
  openVulnAvailable: 1,
  openCriticals: 1,
  openHighs: 2,
  openModerates: 3,
  openUnknowns: 5,
  scorecardScorePts: 5,
  scorecardAvailable: 1,
  scorecardScore: 6.2,
  securityPracticesScore: 6,
  securityPracticesAvailable: 1,
  securityPolicyEnabled: 1,
  branchProtectionEnabled: 1,
  branchProtectionRequiredReviews: 2,
  branchProtectionRequiresStatusChecks: 0,
  branchProtectionAllowsForcePush: 0,
  dependencyHealthScore: 3,
  dependencyHealthAvailable: 1,
  vulnerableDeps: 2,
  releaseCadenceScore: 8,
  releaseCadenceAvailable: 1,
  daysSinceLatest: 12,
  daysBetweenRecent: 30,
  commitActivityScore: 5,
  commitsLast6m: 900,
  lastCommitAt: '2026-09-20 08:15:49.000',
  issueResolutionScore: 4,
  issueResolutionAvailable: 1,
  closed12m: 120,
  opened12m: 150,
  medianCloseS: 86400,
  prMergeScore: 2,
  prMergeAvailable: 0,
  merged12m: 300,
  closedUnmerged12m: 40,
  medianMergeS: 43200,
};

const breakdown = {
  maintainerHealth: {
    busFactor: { score: 12, available: true, count: 4 },
    orgDiversity: { score: 7, available: true, organizationCount: 26 },
    responsiveness: {
      score: 10,
      available: true,
      medianPrResponseSeconds: 3600,
      medianIssueResponseSeconds: 7200.5,
      isGerrit: false,
      isExcluded: false,
    },
  },
  securitySupplyChain: {
    openVulnerabilities: {
      score: 4,
      available: true,
      criticalCount: 1,
      highCount: 2,
      moderateCount: 3,
      unknownCount: 5,
    },
    scorecard: { score: 5, available: true, openssfScore: 6.2 },
    securityPractices: {
      score: 6,
      available: true,
      securityPolicyEnabled: true,
      branchProtectionEnabled: true,
      branchProtectionRequiredReviews: 2,
      branchProtectionRequiresStatusChecks: false,
      branchProtectionAllowsForcePush: false,
    },
    dependencyHealth: { score: 3, available: true, vulnerableDependencyCount: 2 },
  },
  developmentActivity: {
    releaseCadence: {
      score: 8,
      available: true,
      daysSinceLatestRelease: 12,
      daysBetweenRecentReleases: 30,
    },
    commitActivity: { score: 5, commitsLast6Months: 900, lastCommitAt: '2026-09-20T08:15:49.000Z' },
    issueResolution: {
      score: 4,
      available: true,
      closedLast12Months: 120,
      openedLast12Months: 150,
      medianCloseSeconds: 86400,
    },
    pullRequestMerge: {
      score: 2,
      available: false,
      mergedLast12Months: 300,
      closedUnmergedLast12Months: 40,
      medianMergeSeconds: 43200,
    },
  },
};

type Tree = { [key: string]: Tree | unknown };
const nulled = (tree: Tree): Tree =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [
      key,
      value !== null && typeof value === 'object' ? nulled(value as Tree) : null,
    ]),
  );
const allNull = nulled(breakdown);

let rows: unknown[] = [pipeRow];

const { get } = useApp();

beforeEach(() => {
  rows = [pipeRow];
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== projectPipe && url.pathname !== repoPipe) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return rows;
    }),
  );
});

describe('Tinybird call (AC1)', () => {
  it('reads the nightly project pipe by slug without repos', async () => {
    expect((await get(route)).statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(1);
    expect(callsTo(projectPipe)[0]?.searchParams.get('slug')).toBe('kubernetes');
  });

  it('reads the live repo pipe with slug and repos when repos is given', async () => {
    const res = await get(
      `${route}?repos=${encodeURIComponent(repo)}&repos=${encodeURIComponent(other)}`,
    );
    expect(res.statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(1);
    const call = callsTo(repoPipe)[0];
    expect(call?.searchParams.get('slug')).toBe('kubernetes');
    expect(call?.searchParams.get('repos')).toBe(`${repo},${other}`);
    expect(call?.searchParams.get('bucketId')).toBe('7');
    expect(callsTo(projectPipe)).toHaveLength(0);
  });

  it('reads the project pipe when repos holds only empty values', async () => {
    expect((await get(`${route}?repos=`)).statusCode).toBe(200);
    expect(pipeCalls()).toHaveLength(1);
    expect(callsTo(projectPipe)).toHaveLength(1);
    expect(callsTo(repoPipe)).toHaveLength(0);
  });
});

describe('response mapping (AC2)', () => {
  it('nests the signals per category, with booleans and an ISO lastCommitAt', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(breakdown);
  });

  it('maps the repo pipe row the same way and leaves out its category scores', async () => {
    const { projectId: _id, slug: _slug, ...repoRow } = pipeRow;
    rows = [
      {
        ...repoRow,
        maintainerHealthScoreV2: 30,
        securitySupplyChainScoreV2: 20,
        developmentActivityScoreV2: 15,
        healthScoreV2Raw: 65,
      },
    ];
    const res = await get(`${route}?repos=${encodeURIComponent(repo)}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(breakdown);
  });

  it('accepts boolean flags as the pipe may send them', async () => {
    rows = [{ ...pipeRow, busFactorAvailable: true, isGerrit: false, prMergeAvailable: false }];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(breakdown);
  });

  it('keeps null columns null', async () => {
    rows = [
      {
        ...pipeRow,
        busFactorScore: null,
        busFactorAvailable: null,
        isGerrit: null,
        branchProtectionAllowsForcePush: null,
        lastCommitAt: null,
      },
    ];
    const body = (await get(route)).json();
    expect(body.maintainerHealth.busFactor).toEqual({ score: null, available: null, count: 4 });
    expect(body.maintainerHealth.responsiveness.isGerrit).toBeNull();
    expect(body.securitySupplyChain.securityPractices.branchProtectionAllowsForcePush).toBeNull();
    expect(body.developmentActivity.commitActivity.lastCommitAt).toBeNull();
  });
});

describe('empty answer (AC3)', () => {
  it('answers every field null when the project pipe has no row', async () => {
    rows = [];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(allNull);
  });

  it('answers every field null when the selected repos yield no row', async () => {
    rows = [];
    const res = await get(`${route}?repos=${encodeURIComponent(repo)}`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(allNull);
  });

  it('answers every field null for an unknown project', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockImplementation(tinybirdStub(() => [pipeRow], []));
    const res = await get('/v1-alpha/projects/no-such-project/overview/health-score/breakdown');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(allNull);
    vi.restoreAllMocks();
  });
});

describe('row guard (AC4)', () => {
  it.each([
    ['a score that is not a number', { busFactorScore: '12' }],
    ['a flag outside 0/1', { orgDiversityAvailable: 2 }],
    ['a count that is not a number', { openHighs: 'many' }],
    ['a missing column', { medianMergeS: undefined }],
    ['a lastCommitAt that is not a pipe timestamp', { lastCommitAt: 'yesterday' }],
    ['a score above its maximum', { busFactorScore: 19 }],
    ['a negative score', { prMergeScore: -1 }],
    ['an OpenSSF score above 10', { scorecardScore: 10.5 }],
    ['a negative count', { vulnerableDeps: -1 }],
    ['a fractional count', { orgCount: 2.5 }],
  ])('answers 503 for %s', async (_label, patch) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rows = [{ ...pipeRow, ...patch }];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
    expect(res.json().code).toBe('upstream_unavailable');
    vi.restoreAllMocks();
  });

  it('accepts negative durations and day counts, which live data holds', async () => {
    rows = [{ ...pipeRow, medianPrResponseS: -60, daysSinceLatest: -3 }];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json().maintainerHealth.responsiveness.medianPrResponseSeconds).toBe(-60);
    expect(res.json().developmentActivity.releaseCadence.daysSinceLatestRelease).toBe(-3);
  });
});
