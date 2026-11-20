// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';

import { summaryFixture } from '~/components/modules/project/components/docs-readiness/docs-readiness-fixtures';
import { lfxColors } from '~/config/styles/colors';
import type { DocsReadinessState } from '~~/types/docs-readiness/readiness.types';

import {
  displayUrl,
  failureBanner,
  formatDay,
  isHttpUrl,
  lastEvaluatedLabel,
  medianLine,
  nextEvaluationLabel,
  scoreColor,
} from './docs-readiness.service';

describe('docs-readiness.service', () => {
  test('formatDay keeps the UTC day', () => {
    expect(formatDay('2026-12-01')).toBe('Dec 1, 2026');
    expect(formatDay('2026-12-01T02:00:00.000Z')).toBe('Dec 1, 2026');
  });

  test.each([
    [{ value: 50, delta: 5, direction: 'below' }, '5 points below the LF project median of 50'],
    [{ value: 50, delta: 27, direction: 'above' }, '27 points above the LF project median of 50'],
    [{ value: 50, delta: 0, direction: 'equal' }, 'At the LF project median of 50'],
    [{ value: 50, delta: 1, direction: 'below' }, '1 point below the LF project median of 50'],
    [
      { value: 50.5, delta: 5.5, direction: 'below' },
      '5.5 points below the LF project median of 50.5',
    ],
    [null, null],
  ] as const)('medianLine %j', (median, expected) => {
    expect(medianLine(median as never)).toBe(expected);
  });

  test('nextEvaluationLabel', () => {
    expect(nextEvaluationLabel(summaryFixture())).toBe('Dec 1, 2026 · monthly');
    expect(
      nextEvaluationLabel(summaryFixture({ nextEvaluation: { at: null, retryingDaily: true } })),
    ).toBe('Retrying daily');
    expect(nextEvaluationLabel(summaryFixture({ nextEvaluation: null }))).toBeNull();
  });

  test('lastEvaluatedLabel', () => {
    expect(lastEvaluatedLabel(summaryFixture())).toBe('Nov 1, 2026');
    expect(
      lastEvaluatedLabel(summaryFixture({ lastEvaluated: { date: '2026-11-01', failed: true } })),
    ).toBe('Nov 1, 2026 (failed)');
    expect(lastEvaluatedLabel(summaryFixture({ lastEvaluated: null }))).toBeNull();
  });

  test('failureBanner', () => {
    const latestFailed = {
      state: 'latest-failed',
      lastEvaluated: { date: '2026-11-01', failed: true },
    } as const;
    expect(failureBanner(summaryFixture({ ...latestFailed, resultDate: '2026-10-01' }))).toBe(
      'The evaluation on Nov 1, 2026 couldn’t complete. Showing results from Oct 1, 2026.',
    );
    expect(failureBanner(summaryFixture({ ...latestFailed, resultDate: null }))).toBe(
      'The evaluation on Nov 1, 2026 couldn’t complete. Showing the last successful results.',
    );
    expect(failureBanner(summaryFixture({ state: 'failed' }))).toBe(
      'We couldn’t evaluate this documentation site. We’ll retry tomorrow.',
    );
    const others: DocsReadinessState[] = [
      'not-evaluated',
      'scored',
      'confirmed-no-docs',
      'no-docs',
      'repo-only',
    ];
    others.forEach((state) => expect(failureBanner(summaryFixture({ state }))).toBeNull());
  });

  test('scoreColor is the neutral brand color', () => {
    expect(scoreColor()).toBe(lfxColors.brand[500]);
  });

  test('displayUrl and isHttpUrl', () => {
    expect(displayUrl('https://docs.example.org/')).toBe('docs.example.org');
    expect(displayUrl('http://docs.example.org/a/')).toBe('docs.example.org/a');
    expect(isHttpUrl('https://a.io')).toBe(true);
    expect(isHttpUrl('HTTP://a.io')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl(null)).toBe(false);
  });
});
