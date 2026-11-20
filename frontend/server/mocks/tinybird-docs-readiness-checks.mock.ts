// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TinybirdDocsReadinessCheck } from '~~/server/data/tinybird/docs-readiness/checks';

const row = (
  checkId: string,
  category: string,
  status: string,
  message: string,
  testedPages: number | null,
): TinybirdDocsReadinessCheck => ({
  checkId,
  category,
  status,
  message,
  testedPages,
  totalPages: testedPages,
  maxTestedPages: 1,
});

const response = (data: TinybirdDocsReadinessCheck[]) => ({
  meta: [],
  data,
  rows: data.length,
  statistics: { elapsed: 0.01, rows_read: data.length, bytes_read: 1024 },
});

// Rows of the worker's kyverno-results.json fixture, in category, checkId order
export const kyvernoCheckRows: TinybirdDocsReadinessCheck[] = [
  row(
    'auth-alternative-access',
    'authentication',
    'skip',
    'All docs pages are publicly accessible; no alternative access paths needed',
    null,
  ),
  row('auth-gate-detection', 'authentication', 'pass', 'All 1 pages are publicly accessible', 1),
  row(
    'llms-txt-directive-html',
    'content-discoverability',
    'fail',
    'No llms.txt directive found in HTML of any of 1 pages',
    1,
  ),
  row(
    'llms-txt-directive-md',
    'content-discoverability',
    'fail',
    'Could not fetch markdown for any of 1 pages; 1 had no markdown version',
    1,
  ),
  row(
    'llms-txt-exists',
    'content-discoverability',
    'fail',
    'No llms.txt found at any candidate location (https://kyverno.io/docs/llms.txt, https://kyverno.io/llms.txt)',
    1,
  ),
  row(
    'llms-txt-links-markdown',
    'content-discoverability',
    'skip',
    'Skipped: dependency check did not pass',
    null,
  ),
  row(
    'llms-txt-links-resolve',
    'content-discoverability',
    'skip',
    'Skipped: dependency check did not pass',
    null,
  ),
  row(
    'llms-txt-size',
    'content-discoverability',
    'skip',
    'Skipped: dependency check did not pass',
    null,
  ),
  row(
    'llms-txt-valid',
    'content-discoverability',
    'skip',
    'Skipped: dependency check did not pass',
    null,
  ),
  row(
    'markdown-code-fence-validity',
    'content-structure',
    'skip',
    'Site does not serve markdown content; nothing to analyze',
    null,
  ),
  row(
    'section-header-quality',
    'content-structure',
    'pass',
    'No tabbed content found; header quality check not applicable',
    1,
  ),
  row(
    'tabbed-content-serialization',
    'content-structure',
    'pass',
    'No tabbed content detected across 1 pages',
    1,
  ),
  row(
    'content-negotiation',
    'markdown-availability',
    'fail',
    'Server ignores Accept: text/markdown header (0/1 pages return markdown)',
    1,
  ),
  row(
    'markdown-url-support',
    'markdown-availability',
    'fail',
    'No pages support .md URLs (0/1 tested)',
    1,
  ),
  row(
    'cache-header-hygiene',
    'observability',
    'pass',
    'All 1 endpoints have appropriate cache headers',
    1,
  ),
  row('llms-txt-coverage', 'observability', 'skip', 'Skipped: dependency check did not pass', null),
  row(
    'markdown-content-parity',
    'observability',
    'skip',
    'Skipped: dependency check did not pass',
    null,
  ),
  row(
    'content-start-position',
    'page-size',
    'fail',
    '1 of 1 pages have content starting past 50% (worst 71%)',
    1,
  ),
  row(
    'page-size-html',
    'page-size',
    'pass',
    'All 1 pages under 50K chars (median 64K HTML → 9K markdown (86% boilerplate))',
    1,
  ),
  row('page-size-markdown', 'page-size', 'skip', 'Skipped: dependency check did not pass', null),
  row('rendering-strategy', 'page-size', 'pass', 'All 1 pages contain server-rendered content', 1),
  row(
    'http-status-codes',
    'url-stability',
    'pass',
    'All 1 pages return proper error codes for bad URLs',
    1,
  ),
  row(
    'redirect-behavior',
    'url-stability',
    'pass',
    'All 1 redirect(s) across 1 pages are same-host HTTP redirects',
    1,
  ),
];

export const mockChecksKyverno = response(kyvernoCheckRows);
export const mockChecksEmpty = response([]);
