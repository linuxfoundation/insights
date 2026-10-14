// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import {
  isTopCollectionTuple,
  isCategoryTopProjectTuple,
  isTopProjectTuple,
  toCategoryTopProject,
  toTopCollection,
  toTopProject,
} from '../src/lib/oss-index.js';

const collectionTuple = ['c1', 12, 'Web Frameworks', 1500, 0.45];
const projectTuple = [
  'p1',
  30,
  'Node.js',
  'https://logo.test/n.png',
  2400,
  0.8,
  86,
  'Runtime',
  'active',
  74,
  'healthy',
  74,
  100,
];
const withSlot = (index: number, value: unknown) =>
  projectTuple.map((slot, i) => (i === index ? value : slot));

describe('toTopCollection', () => {
  it('names each tuple slot', () => {
    expect(toTopCollection(collectionTuple as never)).toEqual({
      id: 'c1',
      count: 12,
      name: 'Web Frameworks',
      softwareValue: 1500,
      avgScore: 0.45,
    });
  });
});

describe('toTopProject', () => {
  it('names each tuple slot, renames logo to logoUrl and takes the v2 health fields', () => {
    expect(toTopProject(projectTuple as never)).toEqual({
      id: 'p1',
      count: 30,
      name: 'Node.js',
      logoUrl: 'https://logo.test/n.png',
      description: 'Runtime',
      softwareValue: 2400,
      avgScore: 0.8,
      healthScore: 74,
      healthLabel: 'healthy',
      healthMaxScore: 100,
      status: 'active',
    });
  });

  it('keeps null v2 health fields for an unscored project', () => {
    const unscored = [...projectTuple.slice(0, 9), null, null, null, null];
    expect(toTopProject(unscored as never)).toMatchObject({
      healthScore: null,
      healthLabel: null,
      healthMaxScore: null,
    });
  });
});

// The categories pipe sends the project tuple without its status slot.
const categoryProjectTuple = [...projectTuple.slice(0, 8), ...projectTuple.slice(9)];
const withCategorySlot = (index: number, value: unknown) =>
  categoryProjectTuple.map((slot, i) => (i === index ? value : slot));

describe('toCategoryTopProject', () => {
  it('names each tuple slot, renames logo to logoUrl and takes the v2 health fields', () => {
    expect(toCategoryTopProject(categoryProjectTuple as never)).toEqual({
      id: 'p1',
      count: 30,
      name: 'Node.js',
      logoUrl: 'https://logo.test/n.png',
      description: 'Runtime',
      softwareValue: 2400,
      avgScore: 0.8,
      healthScore: 74,
      healthLabel: 'healthy',
      healthMaxScore: 100,
    });
  });
});

describe('isCategoryTopProjectTuple', () => {
  it.each([
    ['a scored', categoryProjectTuple],
    ['an unscored', [...categoryProjectTuple.slice(0, 8), null, null, null, null]],
  ])('accepts a twelve slot tuple with %s health tail', (_label, value) => {
    expect(isCategoryTopProjectTuple(value)).toBe(true);
  });

  it.each([
    ['too short', categoryProjectTuple.slice(0, 11)],
    ['without the health fields', categoryProjectTuple.slice(0, 8)],
    ['a null logo', withCategorySlot(3, null)],
    ['a string v1 health score', withCategorySlot(6, '86')],
    ['an unknown health label', withCategorySlot(9, 'great')],
    [
      'a health score above its maximum',
      [...categoryProjectTuple.slice(0, 8), 80, 'healthy', 100, 75],
    ],
  ])('rejects a tuple that is %s', (_label, value) => {
    expect(isCategoryTopProjectTuple(value)).toBe(false);
  });
});

describe('tuple guards', () => {
  it('accept well-formed tuples', () => {
    expect(isTopCollectionTuple(collectionTuple)).toBe(true);
    expect(isTopProjectTuple(projectTuple)).toBe(true);
    expect(isTopProjectTuple([...projectTuple.slice(0, 9), null, null, null, null])).toBe(true);
    expect(isTopProjectTuple([...projectTuple.slice(0, 9), 64, 'excellent', 85, 75])).toBe(true);
    expect(isTopProjectTuple([...projectTuple.slice(0, 9), 61, 'fair', 61, null])).toBe(true);
  });

  it.each([
    ['not an array', 'x'],
    ['too short', collectionTuple.slice(0, 4)],
    ['too long', [...collectionTuple, 1]],
    ['a null slot', ['c1', 12, null, 1500, 0.45]],
    ['a string count', ['c1', '12', 'n', 1500, 0.45]],
    ['a non-finite score', ['c1', 12, 'n', 1500, Number.NaN]],
    ['a negative count', ['c1', -1, 'n', 1500, 0.45]],
    ['a fractional count', ['c1', 1.5, 'n', 1500, 0.45]],
    ['a fractional software value', ['c1', 12, 'n', 1500.5, 0.45]],
    ['a negative score', ['c1', 12, 'n', 1500, -0.1]],
    ['a score above 1', ['c1', 12, 'n', 1500, 1.1]],
  ])('reject a collection tuple that is %s', (_label, value) => {
    expect(isTopCollectionTuple(value)).toBe(false);
  });

  it.each([
    ['too short', projectTuple.slice(0, 12)],
    ['without the health fields', projectTuple.slice(0, 9)],
    ['a null logo', withSlot(3, null)],
    ['a numeric status', withSlot(8, 1)],
    ['a string v1 health score', withSlot(6, '86')],
    ['a negative count', withSlot(1, -30)],
    ['a fractional count', withSlot(1, 30.5)],
    ['a negative software value', withSlot(4, -2400)],
    ['an unknown health label', withSlot(10, 'great')],
    ['a health score above its maximum', [...projectTuple.slice(0, 9), 80, 'healthy', 100, 75]],
    ['a health maximum no category set gives', withSlot(12, 90)],
    ['a string scaled health score', withSlot(11, '74')],
    ['a negative average score', withSlot(5, -0.1)],
    ['an average score above 1', withSlot(5, 1.1)],
    ['a health score with a null label', [...projectTuple.slice(0, 9), 74, null, 74, 100]],
    [
      'a null health score with a label',
      [...projectTuple.slice(0, 9), null, 'healthy', null, null],
    ],
    ['a null health score with a maximum', [...projectTuple.slice(0, 9), null, null, null, 100]],
  ])('reject a project tuple that is %s', (_label, value) => {
    expect(isTopProjectTuple(value)).toBe(false);
  });
});
