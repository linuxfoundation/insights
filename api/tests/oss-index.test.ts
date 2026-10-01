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
];

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
  it('names each tuple slot and renames logo to logoUrl', () => {
    expect(toTopProject(projectTuple as never)).toEqual({
      id: 'p1',
      count: 30,
      name: 'Node.js',
      logoUrl: 'https://logo.test/n.png',
      description: 'Runtime',
      softwareValue: 2400,
      avgScore: 0.8,
      healthScore: 86,
      status: 'active',
    });
  });
});

describe('tuple guards', () => {
  it('accept well-formed tuples', () => {
    expect(isTopCollectionTuple(collectionTuple)).toBe(true);
    expect(isTopProjectTuple(projectTuple)).toBe(true);
  });

  it.each([
    ['not an array', 'x'],
    ['too short', collectionTuple.slice(0, 4)],
    ['too long', [...collectionTuple, 1]],
    ['a null slot', ['c1', 12, null, 1500, 0.45]],
    ['a string count', ['c1', '12', 'n', 1500, 0.45]],
    ['a non-finite score', ['c1', 12, 'n', 1500, Number.NaN]],
  ])('reject a collection tuple that is %s', (_label, value) => {
    expect(isTopCollectionTuple(value)).toBe(false);
  });

  it.each([
    ['too short', projectTuple.slice(0, 8)],
    ['a null logo', ['p1', 30, 'n', null, 2400, 0.8, 86, 'd', 'active']],
    ['a numeric status', ['p1', 30, 'n', 'l', 2400, 0.8, 86, 'd', 1]],
    ['a string health score', ['p1', 30, 'n', 'l', 2400, 0.8, '86', 'd', 'active']],
  ])('reject a project tuple that is %s', (_label, value) => {
    expect(isTopProjectTuple(value)).toBe(false);
  });
});
