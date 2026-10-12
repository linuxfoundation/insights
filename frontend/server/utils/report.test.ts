// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';

import type { ReportRequest } from '~~/types/report/requests.types';

import { buildIssueTitle, buildIssueBody, buildInternalIssueBody } from './report';

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

  test('omits widget when not present', () => {
    const title = buildIssueTitle({ ...baseRequest, projectName: 'Foo' });
    expect(title).toEqual('[Report issue] Foo');
  });
});

describe('buildInternalIssueBody', () => {
  test('keeps the public body and appends the public link and reporter', () => {
    const issueBody = buildIssueBody(baseRequest);
    const result = buildInternalIssueBody(
      issueBody,
      'https://github.com/linuxfoundation/insights/issues/1',
      'jdoe',
      'jdoe@example.com',
    );

    expect(result.startsWith(issueBody)).toBe(true);
    // The mirror workflow matches this exact line to find the internal copy.
    expect(result.split('\n')).toContain(
      'Public issue: https://github.com/linuxfoundation/insights/issues/1',
    );
    expect(result.endsWith('Reported by: jdoe (jdoe@example.com)')).toBe(true);
  });
});
