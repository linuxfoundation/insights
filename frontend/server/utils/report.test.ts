// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';

import { buildIssueTitle, buildIssueBody, buildJiraDescription } from './report';
import type { ReportRequest } from '~~/types/report/requests.types';

const baseRequest: ReportRequest = {
  description: 'Numbers look wrong',
  steps: 'Open the dashboard',
  expectations: 'Should match the API',
  url: 'https://insights.linuxfoundation.org/project/foo',
  pageTitle: 'Foo Project',
};

describe('buildIssueTitle', () => {
  test('uses project name and widget when present', () => {
    const title = buildIssueTitle({ ...baseRequest, projectName: 'Foo', widget: 'Contributors' });
    expect(title).toEqual('[Report issue] Foo Contributors');
  });

  test('falls back to page title when no project name', () => {
    const title = buildIssueTitle(baseRequest);
    expect(title).toEqual('[Report issue] Foo Project');
  });
});

describe('buildJiraDescription', () => {
  test('appends the GitHub link and user attribution to the GitHub issue body', () => {
    const issueBody = buildIssueBody(baseRequest);
    const result = buildJiraDescription(
      issueBody,
      'https://github.com/linuxfoundation/insights/issues/1',
      'jdoe',
      'jdoe@example.com',
    );

    expect(result.startsWith(issueBody)).toBe(true);
    expect(result).toContain('GitHub issue: https://github.com/linuxfoundation/insights/issues/1');
    expect(result.endsWith('Issue created by user: jdoe jdoe@example.com')).toBe(true);
  });
});
