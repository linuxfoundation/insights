// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DOCS_CORRECTION_DESCRIPTION_MAX, DOCS_URL_MAX } from '~~/config/docs-url-correction';
import type { DocsCorrectionRequest } from '~~/types/docs-readiness/correction.types';
import type { ReportRequest } from '~~/types/report/requests.types';

export function buildIssueTitle(body: ReportRequest): string {
  const label = [body.projectName, body.widget].filter(Boolean).join(' ') || body.pageTitle;
  return `[Report issue] ${label}`;
}

export function buildIssueBody(body: ReportRequest): string {
  const description: string[] = [
    '### Page',
    `[${body.url}](${body.url})`,
    ...(body.projectName ? ['### Project', body.projectName] : []),
    ...(body.area ? ['### Issue Area', body.area] : []),
    ...(body.widget ? ['### Widget', body.widget] : []),
    '### Describe the issue',
    body.description,
    '### Steps to reproduce',
    body.steps,
    '### Expected vs. actual behavior',
    body.expectations,
  ];

  return description.join('\n');
}

// Keep the footer format in sync with .github/workflows/mirror-issue-internal.yml.
export function buildInternalIssueBody(
  issueBody: string,
  githubUrl: string,
  lfid: string,
  email: string,
): string {
  return [issueBody, '---', `Public issue: ${githubUrl}`, `Reported by: ${lfid} (${email})`].join(
    '\n\n',
  );
}

const SLUG_MAX = 200;

function isHttpUrl(value: string): boolean {
  // \s check first: the URL parser silently drops \n and \t, which would let them into the issue body
  if (value.length > DOCS_URL_MAX || !/^https?:\/\/\S+$/i.test(value)) return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

// Shape and size checks only; the route validates requestedDocsUrl once it knows the current URL.
export function parseCorrectionRequest(body: unknown): DocsCorrectionRequest | null {
  if (typeof body !== 'object' || body === null) return null;
  const { projectSlug, url, requestedDocsUrl, description } = body as Record<string, unknown>;

  if (
    typeof projectSlug !== 'string' ||
    !projectSlug.trim() ||
    projectSlug.trim().length > SLUG_MAX
  ) {
    return null;
  }
  if (typeof url !== 'string' || !isHttpUrl(url.trim())) return null;
  if (requestedDocsUrl !== null && typeof requestedDocsUrl !== 'string') return null;
  if (description !== undefined && typeof description !== 'string') return null;
  if ((description ?? '').trim().length > DOCS_CORRECTION_DESCRIPTION_MAX) return null;

  return {
    projectSlug: projectSlug.trim(),
    url: url.trim(),
    requestedDocsUrl: requestedDocsUrl === null ? null : (requestedDocsUrl as string).trim(),
    description: (description ?? '').trim(),
  };
}

export function buildCorrectionIssueTitle(projectName: string): string {
  return `[Docs URL correction] ${projectName}`;
}

export function buildCorrectionIssueBody(input: {
  projectName: string;
  projectSlug: string;
  url: string;
  currentDocsUrl: string | null;
  requestedDocsUrl: string | null;
  description: string;
}): string {
  return [
    '### Project',
    `${input.projectName} (\`${input.projectSlug}\`)`,
    '### Page',
    `[${input.url}](${input.url})`,
    '### Current docs URL',
    input.currentDocsUrl ?? 'none found',
    '### Requested docs URL',
    input.requestedDocsUrl ?? 'no documentation site',
    '### Description',
    input.description || '_No description provided._',
  ].join('\n');
}
