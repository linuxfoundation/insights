// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { Pool } from 'pg';
import { describe, it, expect, vi } from 'vitest';

import { DocsReadinessRepository, buildCorrectionCandidates } from './docsReadiness.repo';

const cand = (url: string, over: Record<string, unknown> = {}) => ({
  url,
  method: 'sitemap',
  confidence: 'high',
  livenessOk: true,
  ...over,
});

const noCurrent = { docsUrl: null, method: null, confidence: null };

describe('buildCorrectionCandidates', () => {
  it('keeps live candidates in stored order', () => {
    const { candidates } = buildCorrectionCandidates(
      [cand('https://b.dev'), cand('https://a.dev')],
      noCurrent,
    );
    expect(candidates.map((c) => c.url)).toEqual(['https://b.dev', 'https://a.dev']);
    expect(candidates.every((c) => !c.isCurrent)).toBe(true);
  });

  it('drops candidates whose liveness check failed', () => {
    const { candidates } = buildCorrectionCandidates(
      [cand('https://a.dev', { livenessOk: false }), cand('https://b.dev')],
      noCurrent,
    );
    expect(candidates.map((c) => c.url)).toEqual(['https://b.dev']);
  });

  it('drops repo-url candidates even when live', () => {
    const { candidates } = buildCorrectionCandidates(
      [cand('https://github.com/a/b', { method: 'repo-url' }), cand('https://b.dev')],
      noCurrent,
    );
    expect(candidates.map((c) => c.url)).toEqual(['https://b.dev']);
  });

  it('puts the current URL first and marks it', () => {
    const result = buildCorrectionCandidates([cand('https://a.dev'), cand('https://b.dev')], {
      docsUrl: 'https://b.dev',
      method: 'homepage',
      confidence: 'medium',
    });
    expect(result.currentDocsUrl).toBe('https://b.dev');
    expect(result.candidates.map((c) => [c.url, c.isCurrent])).toEqual([
      ['https://b.dev', true],
      ['https://a.dev', false],
    ]);
  });

  it('does not list the current URL twice when a candidate differs only by trailing slash, host case or hash', () => {
    const current = {
      docsUrl: 'https://docs.example.dev/guide',
      method: 'sitemap',
      confidence: 'high',
    };
    for (const variant of [
      'https://docs.example.dev/guide/',
      'https://DOCS.example.dev/guide',
      'https://docs.example.dev/guide#intro',
    ]) {
      const { candidates } = buildCorrectionCandidates([cand(variant)], current);
      expect(candidates).toHaveLength(1);
      expect(candidates[0].isCurrent).toBe(true);
    }
  });

  it('lists the current URL when its candidate failed liveness', () => {
    const { candidates } = buildCorrectionCandidates(
      [cand('https://a.dev', { livenessOk: false })],
      { docsUrl: 'https://a.dev', method: 'sitemap', confidence: 'high' },
    );
    expect(candidates).toEqual([
      { url: 'https://a.dev', method: 'sitemap', confidence: 'high', isCurrent: true },
    ]);
  });

  it("lists the current URL when no candidate matches it with the readiness row's method and confidence", () => {
    const { candidates } = buildCorrectionCandidates([cand('https://a.dev')], {
      docsUrl: 'https://override.dev',
      method: 'override',
      confidence: 'high',
    });
    expect(candidates[0]).toEqual({
      url: 'https://override.dev',
      method: 'override',
      confidence: 'high',
      isCurrent: true,
    });
    expect(candidates).toHaveLength(2);
  });

  it('returns no current entry when the latest row has no docs URL', () => {
    const result = buildCorrectionCandidates([cand('https://a.dev')], noCurrent);
    expect(result.currentDocsUrl).toBeNull();
    expect(result.candidates.some((c) => c.isCurrent)).toBe(false);
  });

  it('treats a repo-url latest row as no current URL and keeps the repo link out', () => {
    const result = buildCorrectionCandidates(
      [cand('https://github.com/a/b', { method: 'repo-url' })],
      { docsUrl: 'https://github.com/a/b', method: 'repo-url', confidence: 'low' },
    );
    expect(result).toEqual({ currentDocsUrl: null, candidates: [] });
  });

  it('returns an empty list for null or empty candidates', () => {
    expect(buildCorrectionCandidates(null, noCurrent).candidates).toEqual([]);
    expect(buildCorrectionCandidates([], noCurrent).candidates).toEqual([]);
  });
});

const emptyRow = {
  candidates: null,
  currentDocsUrl: null,
  currentMethod: null,
  currentConfidence: null,
  overrideDocsUrl: null,
  overrideSubmittedAt: null,
};

function createRepo(rows: Record<string, unknown>[]) {
  const query = vi.fn(async () => ({ rows, rowCount: rows.length }));
  return { repo: new DocsReadinessRepository({ query } as unknown as Pool), query };
}

describe('DocsReadinessRepository.findCorrectionContextBySlug', () => {
  it('returns null when the slug matches no project', async () => {
    const { repo } = createRepo([]);
    expect(await repo.findCorrectionContextBySlug('nope')).toBeNull();
  });

  it('runs a single query parameterised by slug', async () => {
    const { repo, query } = createRepo([emptyRow]);
    await repo.findCorrectionContextBySlug('k8s');
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(params).toEqual(['k8s']);
    expect(sql).toContain('projectDocDiscoveries');
    expect(sql).toContain('projectDocReadiness');
    expect(sql).toContain('projectDocOverrides');
  });

  it("returns the active override's submittedAt as an ISO string", async () => {
    const { repo } = createRepo([
      {
        ...emptyRow,
        overrideDocsUrl: 'https://o.dev',
        overrideSubmittedAt: new Date('2026-11-01T10:00:00Z'),
      },
    ]);
    const result = await repo.findCorrectionContextBySlug('k8s');
    expect(result?.override).toEqual({
      docsUrl: 'https://o.dev',
      submittedAt: '2026-11-01T10:00:00.000Z',
    });
  });

  it('returns a no-docs override with a null docsUrl and its date', async () => {
    const { repo } = createRepo([
      { ...emptyRow, overrideDocsUrl: null, overrideSubmittedAt: new Date('2026-11-02T00:00:00Z') },
    ]);
    const result = await repo.findCorrectionContextBySlug('k8s');
    expect(result?.override).toEqual({ docsUrl: null, submittedAt: '2026-11-02T00:00:00.000Z' });
  });

  it('returns override null when there is no active override', async () => {
    const { repo } = createRepo([{ ...emptyRow, candidates: [cand('https://a.dev')] }]);
    const result = await repo.findCorrectionContextBySlug('k8s');
    expect(result?.override).toBeNull();
    expect(result?.candidates).toHaveLength(1);
  });

  it('returns an empty context for a project with no docs rows', async () => {
    const { repo } = createRepo([emptyRow]);
    expect(await repo.findCorrectionContextBySlug('k8s')).toEqual({
      currentDocsUrl: null,
      candidates: [],
      override: null,
    });
  });
});
