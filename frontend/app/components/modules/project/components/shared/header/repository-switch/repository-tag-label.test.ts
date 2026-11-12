// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import { repositoryTagLabel } from './repository-tag-label';

describe('repositoryTagLabel', () => {
  it.each([
    [{ isUnavailable: true, isArchived: false, isExcluded: false }, 'Unavailable'],
    [{ isUnavailable: true, isArchived: true, isExcluded: true }, 'Unavailable'],
    [{ isUnavailable: false, isArchived: true, isExcluded: true }, 'Archived'],
    [{ isUnavailable: false, isArchived: false, isExcluded: true }, 'Excluded'],
    [{ isUnavailable: false, isArchived: false, isExcluded: false }, null],
  ])('labels %o as %s', (flags, label) => {
    expect(repositoryTagLabel(flags)).toBe(label);
  });
});
