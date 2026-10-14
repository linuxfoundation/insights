// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import {
  isTopCollectionTuple,
  isTopProjectTuple,
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

describe('tuple guards', () => {
  it('accept well-formed tuples', () => {
    expect(isTopCollectionTuple(collectionTuple)).toBe(true);
    expect(isTopProjectTuple(projectTuple)).toBe(true);
    expect(isTopProjectTuple([...projectTuple.slice(0, 9), null, null, null, null])).toBe(true);
    expect(isTopProjectTuple([...projectTuple.slice(0, 9), 64, 'excellent', 85, 75])).toBe(true);
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
  ])('reject a project tuple that is %s', (_label, value) => {
    expect(isTopProjectTuple(value)).toBe(false);
  });
});
