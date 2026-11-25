// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import type {
  DocsReadinessCheck,
  DocsReadinessCheckStatus,
} from '~~/types/docs-readiness/readiness.types';

import {
  DOCS_READINESS_CHECK_COPY,
  DOCS_READINESS_CHECK_STATUS,
  DOCS_READINESS_SKIP_REFERENCE,
  docsReadinessCheckFix,
  docsReadinessCheckResult,
  docsReadinessCheckTitle,
} from './docs-readiness-checks';

const check = (overrides: Partial<DocsReadinessCheck> = {}): DocsReadinessCheck => ({
  id: 'llms-txt-exists',
  status: 'fail',
  message: 'stored message',
  skipReason: null,
  testedPages: 1,
  totalPages: 1,
  ...overrides,
});

describe('docs-readiness-checks', () => {
  it('has a title and a fix hint for all 23 checks', () => {
    const entries = Object.values(DOCS_READINESS_CHECK_COPY);
    expect(entries).toHaveLength(23);
    entries.forEach((entry) => {
      expect(entry.title).not.toBe('');
      expect(entry.fix).not.toBe('');
    });
  });

  it('docsReadinessCheckTitle returns the copy title for a known id', () => {
    expect(docsReadinessCheckTitle('llms-txt-exists')).toBe('An llms.txt file is published');
  });

  it('docsReadinessCheckTitle returns the raw id for an unknown id', () => {
    expect(docsReadinessCheckTitle('brand-new-check')).toBe('brand-new-check');
  });

  it.each(['fail', 'error', 'warn'] as DocsReadinessCheckStatus[])(
    'docsReadinessCheckFix returns the hint for %s',
    (status) => {
      expect(docsReadinessCheckFix(check({ status }))).toBe(
        DOCS_READINESS_CHECK_COPY['llms-txt-exists']!.fix,
      );
    },
  );

  it.each(['pass', 'skip'] as DocsReadinessCheckStatus[])(
    'docsReadinessCheckFix returns null for %s',
    (status) => {
      expect(docsReadinessCheckFix(check({ status }))).toBeNull();
    },
  );

  it('docsReadinessCheckFix returns null for an unknown id whatever the status', () => {
    expect(docsReadinessCheckFix(check({ id: 'brand-new-check', status: 'fail' }))).toBeNull();
  });

  it('docsReadinessCheckResult returns the stored message unchanged when there is no skip reason', () => {
    const message = "No llms.txt found (https://a.io/llms.txt) - isn't <b>there</b>";
    expect(docsReadinessCheckResult(check({ message }))).toBe(message);
  });

  it.each([
    ['needs-llms-txt', '(see “An llms.txt file is published”).'],
    ['needs-markdown', '(see Markdown availability).'],
  ] as const)('docsReadinessCheckResult appends the %s reference', (skipReason, reference) => {
    expect(
      docsReadinessCheckResult(check({ status: 'skip', message: 'Needs x', skipReason })),
    ).toBe(`Needs x ${reference}`);
  });

  it('the llms.txt reference quotes the title of llms-txt-exists', () => {
    expect(DOCS_READINESS_SKIP_REFERENCE['needs-llms-txt']).toContain(
      docsReadinessCheckTitle('llms-txt-exists'),
    );
  });

  it('every status has a label and a colour class', () => {
    const statuses: DocsReadinessCheckStatus[] = ['fail', 'error', 'warn', 'pass', 'skip'];
    statuses.forEach((status) => {
      const entry = DOCS_READINESS_CHECK_STATUS[status];
      expect(entry.label).not.toBe('');
      expect(entry.class).toMatch(/^text-/);
    });
  });
});
