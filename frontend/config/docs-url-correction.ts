// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export const DOCS_CORRECTION_DESCRIPTION_MAX = 500;
export const DOCS_URL_MAX = 2048;

export type DocsUrlError = 'invalid' | 'repository' | 'current';

export const docsUrlErrorMessages: Record<DocsUrlError, string> = {
  invalid: 'Enter a full link, starting with https://',
  repository: "That's a code repository. Readiness is scored for documentation websites only.",
  current: "That's the URL we already evaluate.",
};

const REPOSITORY_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org'];

// Matches the worker's normalizeUrl for stored URLs, which are always trimmed and have a scheme.
function normalizeDocsUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    const href = parsed.toString();
    return parsed.pathname !== '/' && href.endsWith('/') ? href.slice(0, -1) : href;
  } catch {
    return url;
  }
}

export function sameDocsUrl(a: string, b: string): boolean {
  return normalizeDocsUrl(a) === normalizeDocsUrl(b);
}

export function validateDocsUrl(value: string, currentDocsUrl: string | null): DocsUrlError | null {
  const url = value.trim();
  if (url.length > DOCS_URL_MAX || !/^https?:\/\/\S+$/i.test(url)) {
    return 'invalid';
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'invalid';
  }
  if (parsed.username || parsed.password || !parsed.hostname.includes('.')) {
    return 'invalid';
  }

  if (REPOSITORY_HOSTS.includes(parsed.hostname.replace(/^www\./, ''))) {
    return 'repository';
  }

  if (currentDocsUrl && sameDocsUrl(url, currentDocsUrl)) {
    return 'current';
  }

  return null;
}

// Stored URLs are shown as text only, never bound to an href.
export function displayDocsUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}
