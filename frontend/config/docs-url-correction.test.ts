// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';

import { displayDocsUrl, sameDocsUrl, validateDocsUrl } from './docs-url-correction';

describe('validateDocsUrl', () => {
  it('accepts a full https link', () => {
    expect(validateDocsUrl('https://kubernetes.io/docs', null)).toBeNull();
  });

  it('accepts a full http link', () => {
    expect(validateDocsUrl('http://kubernetes.io/docs', null)).toBeNull();
  });

  it('rejects a link without a scheme', () => {
    expect(validateDocsUrl('kubernetes.io/docs', null)).toBe('invalid');
  });

  it.each(['ftp://kubernetes.io', 'javascript:alert(1)'])('rejects the scheme in %s', (value) => {
    expect(validateDocsUrl(value, null)).toBe('invalid');
  });

  it('rejects a host without a dot', () => {
    expect(validateDocsUrl('https://localhost', null)).toBe('invalid');
    for (const value of ['https://.', 'https://a.', 'https://localhost.', 'https://a..b']) {
      expect(validateDocsUrl(value, null), value).toBe('invalid');
    }
  });

  it('rejects whitespace, credentials and links over 2048 chars', () => {
    expect(validateDocsUrl('https://kubernetes.io/a b', null)).toBe('invalid');
    expect(validateDocsUrl('https://user:pass@kubernetes.io', null)).toBe('invalid');
    expect(validateDocsUrl(`https://kubernetes.io/${'a'.repeat(2048)}`, null)).toBe('invalid');
  });

  it.each([
    'https://github.com/kubernetes/kubernetes',
    'https://www.github.com/kubernetes',
    'https://gitlab.com/gitlab-org/gitlab',
    'https://www.gitlab.com/x',
    'https://bitbucket.org/atlassian/x',
    'https://github.com',
    'https://github.com./x',
    'https://www.gitlab.com./x',
  ])('rejects the repository link %s', (value) => {
    expect(validateDocsUrl(value, null)).toBe('repository');
  });

  it('accepts docs hosts on those platforms', () => {
    for (const value of [
      'https://kubernetes.github.io/ingress-nginx',
      'https://docs.github.com/en',
      'https://docs.gitlab.com',
    ]) {
      expect(validateDocsUrl(value, null), value).toBeNull();
    }
  });

  it('rejects the current URL, ignoring trailing slash, host case and hash', () => {
    const current = 'https://kubernetes.io/docs';
    expect(validateDocsUrl('https://kubernetes.io/docs/', current)).toBe('current');
    expect(validateDocsUrl('https://KUBERNETES.io/docs', current)).toBe('current');
    expect(validateDocsUrl('https://kubernetes.io/docs#intro', current)).toBe('current');
  });

  it('skips the current check when there is no current URL', () => {
    expect(validateDocsUrl('https://kubernetes.io/docs', null)).toBeNull();
  });

  it('reports invalid before repository before current', () => {
    expect(validateDocsUrl('github.com/x', 'github.com/x')).toBe('invalid');
    expect(validateDocsUrl('https://github.com/x', 'https://github.com/x')).toBe('repository');
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateDocsUrl('  https://kubernetes.io/docs  ', null)).toBeNull();
    expect(validateDocsUrl('  https://kubernetes.io/docs  ', 'https://kubernetes.io/docs')).toBe(
      'current',
    );
  });
});

describe('sameDocsUrl', () => {
  it('matches across trailing slash, host case and hash', () => {
    expect(sameDocsUrl('https://Kubernetes.io/docs/', 'https://kubernetes.io/docs#a')).toBe(true);
  });

  it('keeps different paths apart', () => {
    expect(sameDocsUrl('https://kubernetes.io/docs', 'https://kubernetes.io/blog')).toBe(false);
  });

  it('falls back to string equality for unparseable input', () => {
    expect(sameDocsUrl('not a url', 'not a url')).toBe(true);
    expect(sameDocsUrl('not a url', 'other')).toBe(false);
  });
});

describe('displayDocsUrl', () => {
  it('strips the scheme and a trailing slash', () => {
    expect(displayDocsUrl('https://docs.kubernetes.io/')).toBe('docs.kubernetes.io');
    expect(displayDocsUrl('http://kubernetes.io/docs')).toBe('kubernetes.io/docs');
  });

  it('strips a leading www.', () => {
    expect(displayDocsUrl('https://www.cncf.io')).toBe('cncf.io');
    expect(displayDocsUrl('http://WWW.cncf.io/docs/')).toBe('cncf.io/docs');
    expect(displayDocsUrl('https://docs.www-project.io')).toBe('docs.www-project.io');
  });
});
