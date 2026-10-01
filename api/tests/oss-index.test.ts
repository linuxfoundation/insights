// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import {
  isCollectionProjectTuple,
  isTopCollectionTuple,
  isCategoryTopProjectTuple,
  isTopProjectTuple,
  toCategoryTopProject,
  toCollectionProject,
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

const categoryProjectTuple = projectTuple.slice(0, 8);

describe('toCategoryTopProject', () => {
  it('names each tuple slot and renames logo to logoUrl', () => {
    expect(toCategoryTopProject(categoryProjectTuple as never)).toEqual({
      id: 'p1',
      count: 30,
      name: 'Node.js',
      logoUrl: 'https://logo.test/n.png',
      description: 'Runtime',
      softwareValue: 2400,
      avgScore: 0.8,
      healthScore: 86,
    });
  });
});

describe('isCategoryTopProjectTuple', () => {
  it('accepts an eight slot tuple', () => {
    expect(isCategoryTopProjectTuple(categoryProjectTuple)).toBe(true);
  });

  it.each([
    ['too short', projectTuple.slice(0, 7)],
    ['nine slots', projectTuple],
    ['a null logo', ['p1', 30, 'n', null, 2400, 0.8, 86, 'd']],
    ['a string health score', ['p1', 30, 'n', 'l', 2400, 0.8, '86', 'd']],
  ])('rejects a tuple that is %s', (_label, value) => {
    expect(isCategoryTopProjectTuple(value)).toBe(false);
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
    ['a negative count', ['c1', -1, 'n', 1500, 0.45]],
    ['a fractional count', ['c1', 1.5, 'n', 1500, 0.45]],
    ['a fractional software value', ['c1', 12, 'n', 1500.5, 0.45]],
  ])('reject a collection tuple that is %s', (_label, value) => {
    expect(isTopCollectionTuple(value)).toBe(false);
  });

  it.each([
    ['too short', projectTuple.slice(0, 8)],
    ['a null logo', ['p1', 30, 'n', null, 2400, 0.8, 86, 'd', 'active']],
    ['a numeric status', ['p1', 30, 'n', 'l', 2400, 0.8, 86, 'd', 1]],
    ['a string health score', ['p1', 30, 'n', 'l', 2400, 0.8, '86', 'd', 'active']],
    ['a negative count', ['p1', -30, 'n', 'l', 2400, 0.8, 86, 'd', 'active']],
    ['a fractional count', ['p1', 30.5, 'n', 'l', 2400, 0.8, 86, 'd', 'active']],
    ['a negative software value', ['p1', 30, 'n', 'l', -2400, 0.8, 86, 'd', 'active']],
  ])('reject a project tuple that is %s', (_label, value) => {
    expect(isTopProjectTuple(value)).toBe(false);
  });
});

const collectionProjectTuple = [
  'p1',
  30,
  'Node.js',
  'https://logo.test/n.png',
  2400,
  0.8,
  86,
  'Runtime',
  'nodejs-node',
  'active',
];

describe('collection project tuple', () => {
  it('is accepted when well formed', () => {
    expect(isCollectionProjectTuple(collectionProjectTuple)).toBe(true);
  });

  it.each([
    ['not an array', 'x'],
    ['the 9 slot tuple', projectTuple],
    ['too long', [...collectionProjectTuple, 1]],
    ['a null slug', [...collectionProjectTuple.slice(0, 8), null, 'active']],
    ['a numeric status', [...collectionProjectTuple.slice(0, 9), 1]],
    ['a null logo', ['p1', 30, 'n', null, 1, 1, 1, 'd', 's', 'active']],
    ['a string health score', ['p1', 30, 'n', 'l', 1, 1, '86', 'd', 's', 'active']],
  ])('is rejected when %s', (_label, value) => {
    expect(isCollectionProjectTuple(value)).toBe(false);
  });

  it('is mapped with the slug and logo renamed to logoUrl', () => {
    expect(toCollectionProject(collectionProjectTuple as never)).toEqual({
      id: 'p1',
      count: 30,
      name: 'Node.js',
      slug: 'nodejs-node',
      logoUrl: 'https://logo.test/n.png',
      description: 'Runtime',
      softwareValue: 2400,
      avgScore: 0.8,
      healthScore: 86,
      status: 'active',
    });
  });
});
