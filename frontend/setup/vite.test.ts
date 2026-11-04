// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, expect, test } from 'vitest';

import viteConfig from './vite';

// Vite treats a proxy key starting with ^ as a RegExp and any other key as a path prefix.
const proxyTargetFor = (path: string) => {
  const match = Object.entries(viteConfig.server.proxy).find(([key]) =>
    key.startsWith('^') ? new RegExp(key).test(path) : path.startsWith(key),
  );
  return match?.[1].target;
};

describe('dev server proxy', () => {
  test('sends the product docs to the docs dev server', () => {
    expect(proxyTargetFor('/docs/introduction/what-is-insights/')).toBe('http://localhost:5173');
    expect(proxyTargetFor('/docs/')).toBe('http://localhost:5173');
  });

  test('leaves the API docs to the Nuxt server so the login gate runs', () => {
    expect(proxyTargetFor('/docs/api')).toBeUndefined();
    expect(proxyTargetFor('/docs/api/')).toBeUndefined();
    expect(proxyTargetFor('/docs/api/reference')).toBeUndefined();
    // Logging in from bare /docs/api returns here with a query string (see server/api/auth/callback.ts).
    expect(proxyTargetFor('/docs/api?auth=success')).toBeUndefined();
  });

  test('keeps proxying the blog', () => {
    expect(proxyTargetFor('/blog/some-post')).toBe('http://localhost:5174');
  });
});
