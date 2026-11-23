// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import pluralize from 'pluralize';

import type {
  DocsReadinessCheck,
  DocsReadinessCheckStatus,
  DocsReadinessSkipReason,
} from '~~/types/docs-readiness/readiness.types';

export const DOCS_READINESS_BREAKDOWN_TITLE = 'Score breakdown';
export const DOCS_READINESS_BREAKDOWN_SUBTITLE =
  'Each category earns points up to its weight. Skipped checks don’t count.';

export const DOCS_READINESS_CHECK_STATUS: Record<
  DocsReadinessCheckStatus,
  { label: string; class: string }
> = {
  fail: { label: 'Failed', class: 'text-negative-700' },
  error: { label: 'Couldn’t run', class: 'text-negative-700' },
  warn: { label: 'Needs attention', class: 'text-warning-800' },
  pass: { label: 'Passed', class: 'text-positive-700' },
  skip: { label: 'Skipped', class: 'text-neutral-500' },
};

export const DOCS_READINESS_CHECK_COPY: Record<string, { title: string; fix: string }> = {
  'llms-txt-exists': {
    title: 'An llms.txt file is published',
    fix: 'Publish an llms.txt file at the docs root listing the key pages.',
  },
  'llms-txt-directive-html': {
    title: 'HTML pages point agents to llms.txt',
    fix: 'Add a link to llms.txt in the page HTML.',
  },
  'llms-txt-directive-md': {
    title: 'Markdown pages point agents to llms.txt',
    fix: 'Add a pointer to llms.txt in the Markdown version of pages.',
  },
  'llms-txt-valid': {
    title: 'llms.txt follows the llmstxt.org structure',
    fix: 'Use an H1 title, a short summary, and sections of links.',
  },
  'llms-txt-size': {
    title: 'llms.txt fits agent limits',
    fix: 'Keep llms.txt short; split it into linked sub-indexes if it’s large.',
  },
  'llms-txt-links-resolve': {
    title: 'Links in llms.txt resolve',
    fix: 'Fix or remove links that return errors.',
  },
  'llms-txt-links-markdown': {
    title: 'Links in llms.txt point to Markdown',
    fix: 'Link to the Markdown version of each page.',
  },
  'markdown-url-support': {
    title: 'Pages are available at a .md URL',
    fix: 'Serve a Markdown copy of each page with .md appended to its URL.',
  },
  'content-negotiation': {
    title: 'Server returns Markdown when asked',
    fix: 'Return Markdown for requests sent with Accept: text/markdown.',
  },
  'page-size-html': {
    title: 'HTML pages fit in an agent’s context',
    fix: 'Cut navigation and boilerplate so converted pages stay small.',
  },
  'rendering-strategy': {
    title: 'Content is server-rendered',
    fix: 'Render docs content on the server, not in client-side JavaScript.',
  },
  'content-start-position': {
    title: 'Main content starts near the top',
    fix: 'Reduce navigation and banners before the main content.',
  },
  'page-size-markdown': {
    title: 'Markdown pages fit in an agent’s context',
    fix: 'Split very long pages.',
  },
  'tabbed-content-serialization': {
    title: 'Tabbed content stays compact',
    fix: 'Avoid tabs and accordions that expand into very long text.',
  },
  'section-header-quality': {
    title: 'Headers in tabs name their variant',
    fix: 'Include the variant (language, OS) in headers inside tabs.',
  },
  'markdown-code-fence-validity': {
    title: 'Code blocks are properly fenced',
    fix: 'Close every code fence in the Markdown.',
  },
  'redirect-behavior': {
    title: 'Redirects stay on the same host',
    fix: 'Use same-host HTTP redirects.',
  },
  'http-status-codes': {
    title: 'Missing pages return 404',
    fix: 'Return a 404 status, not 200, for pages that don’t exist.',
  },
  'cache-header-hygiene': {
    title: 'Cache headers allow timely updates',
    fix: 'Avoid very long cache lifetimes on docs pages.',
  },
  'llms-txt-coverage': {
    title: 'llms.txt covers the site',
    fix: 'List more of the site’s pages in llms.txt.',
  },
  'markdown-content-parity': {
    title: 'Markdown matches the HTML page',
    fix: 'Keep Markdown and HTML versions in sync.',
  },
  'auth-gate-detection': {
    title: 'Docs are public',
    fix: 'Make documentation readable without signing in.',
  },
  'auth-alternative-access': {
    title: 'Gated docs offer a public index',
    fix: 'Publish a public llms.txt when pages require sign-in.',
  },
};

export const DOCS_READINESS_SKIP_REFERENCE: Record<DocsReadinessSkipReason, string> = {
  'needs-llms-txt': '(see “An llms.txt file is published”).',
  'needs-markdown': '(see Markdown availability).',
};

export const docsReadinessCheckTitle = (id: string): string =>
  DOCS_READINESS_CHECK_COPY[id]?.title ?? id;

const FIX_STATUSES: DocsReadinessCheckStatus[] = ['fail', 'error', 'warn'];

export const docsReadinessCheckFix = (check: DocsReadinessCheck): string | null =>
  FIX_STATUSES.includes(check.status) ? (DOCS_READINESS_CHECK_COPY[check.id]?.fix ?? null) : null;

export const docsReadinessCheckResult = (check: DocsReadinessCheck): string =>
  check.skipReason
    ? `${check.message} ${DOCS_READINESS_SKIP_REFERENCE[check.skipReason]}`
    : check.message;

export const docsReadinessTestedLine = (check: DocsReadinessCheck): string => {
  if (!check.testedPages) return '';
  if (check.totalPages === null) return ` · ${pluralize('page', check.testedPages, true)} tested`;
  return ` · ${check.testedPages} of ${check.totalPages} ${pluralize('page', check.totalPages)} tested`;
};
