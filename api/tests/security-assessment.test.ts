// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { beforeEach, describe, expect, it } from 'vitest';

import { callsTo, mockFetch, tinybirdStub, useApp } from './helpers/tinybird.js';

const route = '/v1-alpha/projects/kubernetes/security/assessment';
const pipePath = '/v0/pipes/security_and_best_practices.json';

const repo = 'https://github.com/kubernetes/kubernetes';
const client = 'https://github.com/kubernetes/client-go';

const assessment = (result: string, recommendation = '') => ({
  requirementId: 'OSPS-AC-01.01',
  description: 'Require MFA for sensitive actions.',
  message: 'MFA is enforced.',
  recommendation,
  result,
});

const pipeRow = (category: string, repoUrl: string, controlId: string, result = 'Passed') => ({
  evaluationId: `${controlId}-${repoUrl}`,
  category,
  repo: repoUrl,
  controlId,
  message: `${controlId} evaluated.`,
  result,
  assessments: [assessment(result)],
});

// In no particular order, as the pipe has no ORDER BY.
const pipeRows = [
  pipeRow('Vulnerability Management', repo, 'OSPS-VM-02', 'Failed'),
  pipeRow('Legal', client, 'OSPS-LE-02'),
  pipeRow('A New Category', repo, 'OSPS-XX-01', 'Unknown'),
  pipeRow('Access Control', repo, 'OSPS-AC-03', 'Needs Review'),
  pipeRow('Access Control', client, 'OSPS-AC-01'),
  pipeRow('Access Control', repo, 'OSPS-AC-01'),
];

let rows: unknown[] = pipeRows;

const { get } = useApp();

beforeEach(() => {
  rows = pipeRows;
  mockFetch.mockImplementation(
    tinybirdStub((url) => {
      if (url.pathname !== pipePath) {
        throw new Error(`unexpected Tinybird call to ${url.pathname}`);
      }
      return rows;
    }),
  );
});

describe('Tinybird call (AC1)', () => {
  it('sends the project and the repos to the pipe once', async () => {
    await get(`${route}?repos=${encodeURIComponent(repo)}`);
    const calls = callsTo(pipePath);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get('project')).toBe('kubernetes');
    expect(calls[0]?.searchParams.getAll('repos').join(',')).toContain(repo);
  });
});

describe('response mapping (AC2)', () => {
  it('returns each control evaluation with its assessments', async () => {
    rows = [
      {
        ...pipeRow('Access Control', repo, 'OSPS-AC-01'),
        assessments: [assessment('Failed', 'Turn on MFA.'), assessment('Unknown')],
      },
    ];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      data: [
        {
          evaluationId: `OSPS-AC-01-${repo}`,
          category: 'Access Control',
          repo,
          controlId: 'OSPS-AC-01',
          message: 'OSPS-AC-01 evaluated.',
          result: 'Passed',
          assessments: [
            {
              requirementId: 'OSPS-AC-01.01',
              description: 'Require MFA for sensitive actions.',
              message: 'MFA is enforced.',
              result: 'Failed',
              recommendation: 'Turn on MFA.',
            },
            {
              requirementId: 'OSPS-AC-01.01',
              description: 'Require MFA for sensitive actions.',
              message: 'MFA is enforced.',
              result: 'Unknown',
              recommendation: null,
            },
          ],
        },
      ],
    });
  });

  it('keeps a control with no assessments', async () => {
    rows = [{ ...pipeRow('Legal', repo, 'OSPS-LE-02'), assessments: [] }];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json().data[0].assessments).toEqual([]);
  });
});

describe('sort (AC3)', () => {
  it('orders by category order, then repo, then controlId, with unknown categories last', async () => {
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    const order = res
      .json<{ data: { category: string; repo: string; controlId: string }[] }>()
      .data.map((r) => [r.category, r.repo, r.controlId]);
    expect(order).toEqual([
      ['Access Control', client, 'OSPS-AC-01'],
      ['Access Control', repo, 'OSPS-AC-01'],
      ['Access Control', repo, 'OSPS-AC-03'],
      ['Legal', client, 'OSPS-LE-02'],
      ['Vulnerability Management', repo, 'OSPS-VM-02'],
      ['A New Category', repo, 'OSPS-XX-01'],
    ]);
  });
});

describe('row guard (AC4)', () => {
  const good = pipeRow('Access Control', repo, 'OSPS-AC-01');
  const { recommendation: _, ...withoutRecommendation } = assessment('Passed');
  const { requirementId: __, ...withoutRequirement } = assessment('Passed');

  it.each([
    ['a missing evaluationId', { ...good, evaluationId: undefined }],
    ['a numeric controlId', { ...good, controlId: 7 }],
    ['a missing message', { ...good, message: undefined }],
    ['a result outside the enum', { ...good, result: 'Skipped' }],
    ['assessments that are not a list', { ...good, assessments: {} }],
    ['an assessment that is not an object', { ...good, assessments: ['Passed'] }],
    ['an assessment without a requirementId', { ...good, assessments: [withoutRequirement] }],
    ['an assessment result outside the enum', { ...good, assessments: [assessment('Skipped')] }],
    [
      'an assessment with a non-string value',
      { ...good, assessments: [{ ...assessment('Passed'), message: 3 }] },
    ],
  ])('answers 503 for %s', async (_label, row) => {
    rows = [good, row];
    const res = await get(route);
    expect(res.statusCode).toBe(503);
  });

  it('answers null for an assessment without a recommendation key', async () => {
    rows = [{ ...good, assessments: [withoutRecommendation] }];
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json().data[0].assessments[0].recommendation).toBeNull();
  });
});

describe('unknown project (AC5)', () => {
  it('answers an empty list without calling the pipe', async () => {
    mockFetch.mockImplementation(tinybirdStub(() => pipeRows, []));
    const res = await get(route);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [] });
    expect(callsTo(pipePath)).toHaveLength(0);
  });
});
