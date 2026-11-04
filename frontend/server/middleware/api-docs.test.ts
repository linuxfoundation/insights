// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// @vitest-environment node

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createApp, eventHandler, toWebHandler, type EventHandler } from 'h3';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const root = mkdtempSync(join(tmpdir(), 'api-docs-'));
const docsDir = join(root, 'dist');
const runtimeConfig = { apiDocsDir: docsDir, public: {} };

const verifyOrRefreshOidcToken = vi.fn();
vi.mock('../utils/auth-refresh', () => ({
  verifyOrRefreshOidcToken: (...args: unknown[]) => verifyOrRefreshOidcToken(...args),
}));

global.defineEventHandler = vi.fn((handler) => handler);
mockNuxtImport('useRuntimeConfig', () => () => runtimeConfig);

const files: Record<string, string> = {
  'index.html': '<html>API docs home</html>',
  'reference.html': '<html>API Reference</html>',
  '404.html': '<html>Docs page not found</html>',
  'assets/app.js': 'console.log("docs")',
  'assets/style.css': 'body{}',
  'openapi/v1-alpha.json': '{"openapi":"3.1.0"}',
};

let request: (path: string) => Promise<Response>;

beforeAll(async () => {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(docsDir, path, '..'), { recursive: true });
    writeFileSync(join(docsDir, path), body);
  }
  writeFileSync(join(root, 'secret.txt'), 'outside the docs dir');

  const middleware = (await import('./api-docs')).default as EventHandler;
  const app = createApp();
  app.use(middleware);
  app.use(eventHandler(() => 'nuxt page'));
  const handler = toWebHandler(app);
  request = (path) => handler(new Request(`http://insights.test${path}`));
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

beforeEach(() => verifyOrRefreshOidcToken.mockReset());

const loggedIn = () => verifyOrRefreshOidcToken.mockResolvedValue({ sub: 'auth0|user' });
const anonymous = () => verifyOrRefreshOidcToken.mockResolvedValue(null);

describe('API docs for anonymous visitors', () => {
  it.each([
    '/docs/api',
    '/docs/api/',
    '/docs/api/reference',
    '/docs/api/reference?tab=v1-alpha',
    '/docs/api/assets/app.js',
    '/docs/api/openapi/v1-alpha.json',
  ])('redirects %s to login and back', async (path) => {
    anonymous();

    const res = await request(path);

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(
      `/api/auth/login?redirectTo=${encodeURIComponent(path)}`,
    );
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(await res.text()).not.toMatch(/API docs home|API Reference|openapi|console\.log/);
  });
});

describe('API docs for logged-in users', () => {
  beforeEach(loggedIn);

  it('checks the session through the refreshing verifier', async () => {
    await request('/docs/api/');

    expect(verifyOrRefreshOidcToken).toHaveBeenCalledTimes(1);
  });

  it.each(['/docs/api', '/docs/api/'])('serves the docs home at %s', async (path) => {
    const res = await request(path);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    expect(await res.text()).toBe(files['index.html']);
  });

  it.each([
    ['/docs/api/assets/app.js', /javascript/, 'assets/app.js'],
    ['/docs/api/assets/style.css', /text\/css/, 'assets/style.css'],
    ['/docs/api/openapi/v1-alpha.json', /application\/json/, 'openapi/v1-alpha.json'],
    ['/docs/api/reference.html', /text\/html/, 'reference.html'],
  ])('serves %s with its content type', async (path, contentType, file) => {
    const res = await request(path);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(contentType);
    expect(await res.text()).toBe(files[file]);
  });

  it('serves an extensionless page from its .html file', async () => {
    const res = await request('/docs/api/reference?tab=v1-alpha');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    expect(await res.text()).toBe(files['reference.html']);
  });

  it('answers an unknown page with the docs 404 page', async () => {
    const res = await request('/docs/api/no-such-page');

    expect(res.status).toBe(404);
    expect(await res.text()).toBe(files['404.html']);
  });

  // The URL parser normalizes a bare %2e%2e segment before the middleware runs, so these cases hide
  // the traversal inside one segment behind an encoded slash.
  it.each([
    '/docs/api/..%2fsecret.txt',
    '/docs/api/%2e%2e%2fsecret.txt',
    '/docs/api/assets/%2e%2e%2f%2e%2e%2fsecret.txt',
    '/docs/api/assets/..%2f..%2f..%2fsecret.txt',
  ])('never reads outside the docs dir for %s', async (path) => {
    const res = await request(path);

    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain('outside the docs dir');
  });

  it.each(['/docs/api/', '/docs/api/assets/app.js', '/docs/api/no-such-page'])(
    'keeps %s out of shared caches',
    async (path) => {
      const res = await request(path);

      expect(res.headers.get('cache-control')).toBe('private, no-store');
    },
  );
});

describe('paths outside the API docs', () => {
  it.each(['/docs', '/docs/', '/docs/introduction/what-is-insights/', '/docs/apis', '/project/x'])(
    'leaves %s to the rest of the app without a session check',
    async (path) => {
      const res = await request(path);

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('nuxt page');
      expect(verifyOrRefreshOidcToken).not.toHaveBeenCalled();
    },
  );
});
