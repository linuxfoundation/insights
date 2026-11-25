// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon';

import { lfxColors } from '~/config/styles/colors';
import type { DocsReadinessSummary } from '~~/types/docs-readiness/readiness.types';

export const formatDay = (date: string) =>
  DateTime.fromISO(date, { zone: 'utc' }).toFormat('MMM d, yyyy');

export const formatMonth = (month: string, format = 'MMM') =>
  DateTime.fromISO(month, { zone: 'utc' }).toFormat(format);

export { displayDocsUrl as displayUrl } from '~~/config/docs-url-correction';

export const isHttpUrl = (url: string | null): url is string => !!url && /^https?:\/\//i.test(url);

// One neutral color for every score until a grade is shown
export const scoreColor = () => lfxColors.brand[500];

export const medianLine = (median: DocsReadinessSummary['median']): string | null => {
  if (!median) return null;
  if (median.direction === 'equal') return `At the LF project median of ${median.value}`;
  const points = `${median.delta} ${median.delta === 1 ? 'point' : 'points'}`;
  return `${points} ${median.direction} the LF project median of ${median.value}`;
};

export const lastEvaluatedLabel = (summary: DocsReadinessSummary): string | null => {
  if (!summary.lastEvaluated) return null;
  const day = formatDay(summary.lastEvaluated.date);
  return summary.lastEvaluated.failed ? `${day} (failed)` : day;
};

export const nextEvaluationLabel = (summary: DocsReadinessSummary): string | null => {
  const next = summary.nextEvaluation;
  if (!next) return null;
  if (next.retryingDaily) return 'Retrying daily';
  return next.at ? `${formatDay(next.at)} · monthly` : null;
};

export const failureBanner = (summary: DocsReadinessSummary): string | null => {
  if (summary.state === 'failed') {
    return 'We couldn’t evaluate this documentation site. We’ll retry tomorrow.';
  }
  if (summary.state !== 'latest-failed') return null;
  const failedOn = summary.lastEvaluated ? ` on ${formatDay(summary.lastEvaluated.date)}` : '';
  const shown = summary.resultDate
    ? `Showing results from ${formatDay(summary.resultDate)}.`
    : 'Showing the last successful results.';
  return `The evaluation${failedOn} couldn’t complete. ${shown}`;
};
