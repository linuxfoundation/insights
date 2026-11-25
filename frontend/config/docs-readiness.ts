// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { DocsReadinessSkipReason } from '~~/types/docs-readiness/readiness.types';

// Weights copied from the worker's CATEGORY_WEIGHTS (docs_readiness_worker/src/scoring/computeScores.ts)
export const DOCS_READINESS_CATEGORIES = [
  {
    key: 'content-discoverability',
    name: 'Content discoverability',
    weight: 30,
    description: 'Whether agents can find an index of the docs through llms.txt.',
  },
  {
    key: 'markdown-availability',
    name: 'Markdown availability',
    weight: 15,
    description: 'Whether pages can be fetched as clean Markdown instead of HTML.',
  },
  {
    key: 'page-size',
    name: 'Page size',
    weight: 15,
    description: 'Whether pages fit in an agent’s context window and content starts early.',
  },
  {
    key: 'content-structure',
    name: 'Content structure',
    weight: 10,
    description: 'Whether tabs, headers and code blocks survive conversion to text.',
  },
  {
    key: 'url-stability',
    name: 'URL stability',
    weight: 10,
    description: 'Whether URLs return correct status codes and redirect cleanly.',
  },
  {
    key: 'observability',
    name: 'Observability',
    weight: 10,
    description: 'Whether llms.txt and Markdown stay complete and current.',
  },
  {
    key: 'authentication',
    name: 'Authentication',
    weight: 10,
    description: 'Whether the docs are reachable without signing in.',
  },
] as const;

export const DOCS_READINESS_METHOD_LABELS: Record<string, string> = {
  'llms-txt-probe': 'Found via its llms.txt',
  'docs-subdomain': 'Found at a docs subdomain',
  'docs-path': 'Found at a /docs path',
  'package-manifest': 'Listed in the package manifest',
  'readme-scrape': 'Linked from the README',
  'github-homepage': 'Set as the GitHub repository homepage',
  serp: 'Found via web search',
  'project-website': 'Project website',
  'repo-url': 'Code repository',
  override: 'Confirmed by LF team',
};

export const DOCS_READINESS_CONFIDENCE_LABELS: Record<string, { label: string; tooltip: string }> =
  {
    authoritative: {
      label: 'Confirmed',
      tooltip: 'The LF team confirmed this is the project’s documentation site.',
    },
    high: {
      label: 'High confidence',
      tooltip:
        'Found where projects usually publish their docs, so it’s very likely the right site.',
    },
    medium: {
      label: 'Medium confidence',
      tooltip:
        'This is probably the project’s docs site. If it isn’t, you can request a correction.',
    },
    low: {
      label: 'Low confidence',
      tooltip:
        'We couldn’t confirm this is the project’s docs site. If it’s wrong, you can request a correction.',
    },
  };

export const DOCS_READINESS_DEPENDENCY_SKIP_MESSAGE = 'Skipped: dependency check did not pass';

const NEEDS_LLMS_TXT = { reason: 'needs-llms-txt', message: 'Needs an llms.txt file' } as const;
const NEEDS_MARKDOWN = {
  reason: 'needs-markdown',
  message: 'Needs a Markdown version of pages',
} as const;

export const DOCS_READINESS_SKIP_REASONS: Record<
  string,
  { reason: DocsReadinessSkipReason; message: string }
> = {
  'llms-txt-valid': NEEDS_LLMS_TXT,
  'llms-txt-size': NEEDS_LLMS_TXT,
  'llms-txt-links-resolve': NEEDS_LLMS_TXT,
  'llms-txt-links-markdown': NEEDS_LLMS_TXT,
  'llms-txt-coverage': NEEDS_LLMS_TXT,
  'llms-txt-directive-md': NEEDS_MARKDOWN,
  'markdown-content-parity': NEEDS_MARKDOWN,
  'page-size-markdown': NEEDS_MARKDOWN,
};
