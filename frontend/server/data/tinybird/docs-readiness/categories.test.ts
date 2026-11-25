// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import { DOCS_READINESS_CATEGORIES } from '~~/config/docs-readiness';

import { categoryPoints, findBiggestGap, parseCategoryScores } from './categories';

const kyverno = {
  'content-discoverability': 0,
  'markdown-availability': 0,
  'page-size': 67,
  'content-structure': 100,
  'url-stability': 100,
  observability: 100,
  authentication: 100,
};

const opentelemetry = {
  authentication: 100,
  'content-discoverability': 86,
  'content-structure': 100,
  'markdown-availability': 100,
  observability: 33,
  'page-size': 50,
  'url-stability': 50,
};

describe('docs readiness categories', () => {
  it('weights match the worker and add up to 100', () => {
    expect(DOCS_READINESS_CATEGORIES.map((c) => [c.key, c.weight])).toEqual([
      ['content-discoverability', 30],
      ['markdown-availability', 15],
      ['page-size', 15],
      ['content-structure', 10],
      ['url-stability', 10],
      ['observability', 10],
      ['authentication', 10],
    ]);
    expect(DOCS_READINESS_CATEGORIES.reduce((sum, c) => sum + c.weight, 0)).toBe(100);
  });

  it.each([
    ['an empty string', ''],
    ['undefined', undefined],
    ['invalid JSON', '{not json'],
    ['an array', '[1,2]'],
    ['a non-object', '42'],
  ])('parseCategoryScores returns null for %s', (_, raw) => {
    expect(parseCategoryScores(raw)).toBeNull();
  });

  it('parseCategoryScores keeps the seven stored percentages', () => {
    expect(parseCategoryScores(JSON.stringify(opentelemetry))).toEqual(opentelemetry);
  });

  it('parseCategoryScores drops non-numeric values', () => {
    expect(parseCategoryScores('{"page-size":"x","observability":10}')).toEqual({
      observability: 10,
    });
  });

  it.each([
    [86, 30, 26],
    [33, 10, 3],
    [50, 15, 8],
    [67, 15, 10],
    [0, 30, 0],
    [100, 10, 10],
  ])('categoryPoints rounds like the design (%i x %i -> %i)', (percent, weight, expected) => {
    expect(categoryPoints(percent, weight)).toBe(expected);
  });

  it('findBiggestGap picks the category with the most points lost', () => {
    expect(findBiggestGap(kyverno)).toEqual({
      key: 'content-discoverability',
      name: 'Content discoverability',
      earned: 0,
      weight: 30,
    });
  });

  it('findBiggestGap prefers the higher weight on a tie', () => {
    expect(findBiggestGap(opentelemetry)).toEqual({
      key: 'page-size',
      name: 'Page size',
      earned: 8,
      weight: 15,
    });
  });

  it('findBiggestGap keeps list order when lost points and weight both tie', () => {
    expect(
      findBiggestGap({ 'content-structure': 50, 'url-stability': 50, observability: 50 })?.key,
    ).toBe('content-structure');
  });

  it('findBiggestGap returns null when no points are lost', () => {
    expect(
      findBiggestGap(Object.fromEntries(Object.keys(kyverno).map((k) => [k, 100]))),
    ).toBeNull();
  });

  it('findBiggestGap ignores categories it has no weight for', () => {
    expect(findBiggestGap({ mystery: 0, observability: 90 })?.key).toBe('observability');
  });
});
