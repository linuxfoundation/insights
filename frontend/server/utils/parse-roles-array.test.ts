// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';

import { parseRolesArray } from './parse-roles-array';

describe('parseRolesArray', () => {
  it('returns a real array as-is', () => {
    expect(parseRolesArray(['contributor', 'maintainer'])).toEqual(['contributor', 'maintainer']);
    expect(parseRolesArray([])).toEqual([]);
  });

  it('parses a ClickHouse array string with multiple roles', () => {
    expect(parseRolesArray("['maintainer','owner']")).toEqual(['maintainer', 'owner']);
    expect(parseRolesArray("['maintainer', 'owner']")).toEqual(['maintainer', 'owner']);
  });

  it('parses a ClickHouse array string with a single role', () => {
    expect(parseRolesArray("['contributor']")).toEqual(['contributor']);
  });

  it.each([['[]'], [''], [null], [undefined]])('returns [] for %j', (raw) => {
    expect(parseRolesArray(raw)).toEqual([]);
  });
});
