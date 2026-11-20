// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import { docsCandidateMeta } from './docs-readiness-labels';

describe('docsCandidateMeta', () => {
  it('joins method and confidence labels', () => {
    expect(docsCandidateMeta('docs-subdomain', 'high')).toBe(
      'Found at a docs subdomain · High confidence',
    );
  });

  it('shows only the method label for an override', () => {
    expect(docsCandidateMeta('override', 'authoritative')).toBe('Confirmed by LF team');
  });

  it('skips unknown or missing values', () => {
    expect(docsCandidateMeta('mystery', 'low')).toBe('Low confidence');
    expect(docsCandidateMeta('serp', null)).toBe('Found via web search');
    expect(docsCandidateMeta(null, null)).toBe('');
  });
});
