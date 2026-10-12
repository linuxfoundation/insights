// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
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

// Body of the internal (private repo) copy: the public body unchanged, then a footer with the
// public issue link and the reporter. Keep the footer format in sync with
// .github/workflows/mirror-issue-internal.yml, which builds the same footer for issues opened by hand.
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
