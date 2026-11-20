// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';

import type { ReportRequest } from '~~/types/report/requests.types';

import {
  buildIssueTitle,
  buildIssueBody,
  buildInternalIssueBody,
  buildCorrectionIssueTitle,
  buildCorrectionIssueBody,
  parseCorrectionRequest,
} from './report';

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
    expect(result.split('\n')).toContain(
      'Public issue: https://github.com/linuxfoundation/insights/issues/1',
    );
    expect(result.endsWith('Reported by: jdoe (jdoe@example.com)')).toBe(true);
  });
});

const correctionInput = {
  projectName: 'Kubernetes',
  projectSlug: 'kubernetes',
  url: 'https://insights.linuxfoundation.org/project/kubernetes/security',
  currentDocsUrl: 'https://docs.kubernetes.io' as string | null,
  requestedDocsUrl: 'https://kubernetes.io/docs' as string | null,
  description: 'docs.kubernetes.io redirects to kubernetes.io.',
};

describe('buildCorrectionIssueTitle', () => {
  test('prefixes the project name', () => {
    expect(buildCorrectionIssueTitle('Kubernetes')).toEqual('[Docs URL correction] Kubernetes');
  });
});

describe('buildCorrectionIssueBody', () => {
  test('lists project name and slug, page, current URL, requested URL and description in order', () => {
    expect(buildCorrectionIssueBody(correctionInput).split('\n')).toEqual([
      '### Project',
      'Kubernetes (`kubernetes`)',
      '### Page',
      '[https://insights.linuxfoundation.org/project/kubernetes/security](https://insights.linuxfoundation.org/project/kubernetes/security)',
      '### Current docs URL',
      'https://docs.kubernetes.io',
      '### Requested docs URL',
      'https://kubernetes.io/docs',
      '### Description',
      'docs.kubernetes.io redirects to kubernetes.io.',
    ]);
  });

  test('prints "none found" without a current URL', () => {
    const body = buildCorrectionIssueBody({ ...correctionInput, currentDocsUrl: null });
    expect(body.split('\n')).toContain('none found');
  });

  test('prints "no documentation site" for a no-docs request', () => {
    const body = buildCorrectionIssueBody({ ...correctionInput, requestedDocsUrl: null });
    expect(body.split('\n')).toContain('no documentation site');
  });

  test('prints a placeholder for an empty description', () => {
    const body = buildCorrectionIssueBody({ ...correctionInput, description: '' });
    expect(body.endsWith('_No description provided._')).toBe(true);
  });

  test('works with buildInternalIssueBody', () => {
    const issueBody = buildCorrectionIssueBody(correctionInput);
    const result = buildInternalIssueBody(
      issueBody,
      'https://github.com/x/y/issues/1',
      'jdoe',
      'j@e.com',
    );
    expect(result.startsWith(issueBody)).toBe(true);
    expect(result.endsWith('Reported by: jdoe (j@e.com)')).toBe(true);
  });
});

describe('parseCorrectionRequest', () => {
  const valid = {
    projectSlug: '  kubernetes ',
    url: ' https://insights.linuxfoundation.org/project/kubernetes ',
    requestedDocsUrl: ' https://kubernetes.io/docs ',
    description: ' hi ',
  };

  test('returns trimmed fields for a valid body', () => {
    expect(parseCorrectionRequest(valid)).toEqual({
      projectSlug: 'kubernetes',
      url: 'https://insights.linuxfoundation.org/project/kubernetes',
      requestedDocsUrl: 'https://kubernetes.io/docs',
      description: 'hi',
    });
  });

  test('accepts a null requestedDocsUrl', () => {
    expect(
      parseCorrectionRequest({ ...valid, requestedDocsUrl: null })?.requestedDocsUrl,
    ).toBeNull();
  });

  test('defaults a missing description to an empty string', () => {
    expect(parseCorrectionRequest({ ...valid, description: undefined })?.description).toEqual('');
  });

  test('rejects a non-object body', () => {
    expect(parseCorrectionRequest(null)).toBeNull();
    expect(parseCorrectionRequest('x')).toBeNull();
  });

  test('rejects a missing or empty projectSlug', () => {
    expect(parseCorrectionRequest({ ...valid, projectSlug: undefined })).toBeNull();
    expect(parseCorrectionRequest({ ...valid, projectSlug: '  ' })).toBeNull();
    expect(parseCorrectionRequest({ ...valid, projectSlug: 'a'.repeat(201) })).toBeNull();
  });

  test('rejects a page url that is not http(s)', () => {
    expect(parseCorrectionRequest({ ...valid, url: 'javascript:alert(1)' })).toBeNull();
    expect(parseCorrectionRequest({ ...valid, url: 'nope' })).toBeNull();
    expect(
      parseCorrectionRequest({ ...valid, url: 'https://x.dev/a\n### Requested docs URL\n@team' }),
    ).toBeNull();
  });

  test('rejects a description over 500 characters and accepts exactly 500', () => {
    expect(parseCorrectionRequest({ ...valid, description: 'a'.repeat(501) })).toBeNull();
    expect(parseCorrectionRequest({ ...valid, description: 'a'.repeat(500) })).not.toBeNull();
  });

  test('rejects a non-string requestedDocsUrl', () => {
    expect(parseCorrectionRequest({ ...valid, requestedDocsUrl: 5 })).toBeNull();
    expect(parseCorrectionRequest({ ...valid, requestedDocsUrl: undefined })).toBeNull();
  });
});
