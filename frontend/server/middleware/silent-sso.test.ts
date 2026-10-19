// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// Node's Request keeps the sec-fetch-* headers that the browser-like test environment strips.
// @vitest-environment node

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createApp, eventHandler, toWebHandler, type EventHandler } from 'h3';
import { describe, it, expect, vi, beforeAll } from 'vitest';

const runtimeConfig = {
  public: {
    appUrl: 'https://insights.linuxfoundation.org',
    auth0Domain: 'sso.linuxfoundation.org',
  },
};

global.defineEventHandler = vi.fn((handler) => handler);
mockNuxtImport('useRuntimeConfig', () => () => runtimeConfig);

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

const navigationHeaders = {
  'user-agent': CHROME_UA,
  'sec-fetch-mode': 'navigate',
  'sec-fetch-dest': 'document',
  referer: 'https://openprofile.dev/',
};

let request: (path: string, init?: RequestInit) => Promise<Response>;

beforeAll(async () => {
  const middleware = (await import('./silent-sso')).default as EventHandler;
  const app = createApp();
  app.use(middleware);
  app.use(eventHandler(() => 'page'));
  const handler = toWebHandler(app);
  request = (path, init) => handler(new Request(`http://insights.test${path}`, init));
});

const navigate = (path: string, headers: Record<string, string> = {}) =>
  request(path, { headers: { ...navigationHeaders, ...headers } });

const expectNoBounce = async (response: Promise<Response>) => {
  const res = await response;
  expect(res.status).toBe(200);
  expect(await res.text()).toBe('page');
};

describe('silent SSO before render', () => {
  it('bounces an anonymous page navigation into silent login', async () => {
    const res = await navigate('/leaderboards');

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(
      '/api/auth/login?silent=true&redirectTo=%2Fleaderboards',
    );
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('keeps the query and strips the auth param from redirectTo', async () => {
    const res = await navigate('/project/k8s?timeRange=past365days&auth=foo');

    const location = new URL(res.headers.get('location')!, 'http://insights.test');
    expect(location.searchParams.get('redirectTo')).toBe('/project/k8s?timeRange=past365days');
  });

  it('bounces the home page', async () => {
    const res = await navigate('/');

    expect(res.headers.get('location')).toBe('/api/auth/login?silent=true&redirectTo=%2F');
  });

  it.each([
    '//evil.com/leaderboards',
    '/%2F%2Fevil.com%2Fleaderboards',
    '/.//evil.com/leaderboards',
    '/%5Cevil.com/leaderboards',
  ])('keeps redirectTo for %s on this origin', async (path) => {
    const res = await navigate(path);

    expect(res.status).toBe(302);
    const location = new URL(res.headers.get('location')!, 'http://insights.test');
    expect(location.host).toBe('insights.test');
    const redirectTo = location.searchParams.get('redirectTo')!;
    expect(new URL(redirectTo, 'http://insights.test').host).toBe('insights.test');
  });

  it('does not bounce non-GET requests', async () => {
    await expectNoBounce(request('/leaderboards', { method: 'POST', headers: navigationHeaders }));
  });

  it('does not bounce requests without fetch metadata', async () => {
    await expectNoBounce(request('/leaderboards', { headers: { 'user-agent': CHROME_UA } }));
  });

  it.each([
    ['iframe', { 'sec-fetch-dest': 'iframe' }],
    ['fetch', { 'sec-fetch-mode': 'cors', 'sec-fetch-dest': 'empty' }],
    ['Sec-Purpose prefetch', { 'sec-purpose': 'prefetch' }],
    ['Sec-Purpose prerender', { 'sec-purpose': 'prefetch;prerender' }],
    ['Purpose prefetch', { purpose: 'prefetch' }],
    ['a non-Mozilla agent', { 'user-agent': 'curl/8.7.1' }],
    ['Googlebot', { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }],
    ['HeadlessChrome', { 'user-agent': 'Mozilla/5.0 HeadlessChrome/129.0.0.0 Safari/537.36' }],
    ['a session cookie', { cookie: 'insights_oidc_token=abc' }],
    ['a refresh token cookie', { cookie: 'insights_refresh_token=abc' }],
    ['a login in flight', { cookie: 'auth_pkce=%7B%22silent%22%3Atrue%7D' }],
  ])('does not bounce %s', async (_name, headers) => {
    await expectNoBounce(navigate('/leaderboards', headers));
  });

  it.each(['logout', 'success'])('does not bounce the auth=%s landing', async (value) => {
    await expectNoBounce(navigate(`/leaderboards?auth=${value}`));
  });

  it.each([
    '/api/auth/user',
    '/auth/callback',
    '/callback',
    '/_nuxt/entry.js',
    '/__nuxt_error',
    '/_payload.json',
    '/project/k8s/_payload.json',
    '/_og/d/c_project,p_abc.png',
    '/_ipx/w_100/images/logo.svg',
    '/__sitemap__/style.xsl',
    '/embed/project/k8s',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/llms.txt',
    '/docs',
    '/docs/getting-started',
    '/blog/post',
  ])('does not bounce the non-page route %s', async (path) => {
    await expectNoBounce(navigate(path));
  });
});

describe('silent SSO referrer scoping', () => {
  it.each([
    'https://openprofile.dev/',
    'https://openprofile.dev/profile',
    'https://lfx.linuxfoundation.org/',
    'https://mentorship.lfx.linuxfoundation.org/',
    'https://linuxfoundation.org/',
    'https://app.lfx.dev/',
  ])('bounces a visitor arriving from %s', async (referer) => {
    const res = await navigate('/leaderboards', { referer });

    expect(res.status).toBe(302);
  });

  it('does not bounce a visitor without a referrer', async () => {
    await expectNoBounce(
      request('/leaderboards', {
        headers: {
          'user-agent': CHROME_UA,
          'sec-fetch-mode': 'navigate',
          'sec-fetch-dest': 'document',
        },
      }),
    );
  });

  it.each([
    'https://www.google.com/',
    'https://insights.linuxfoundation.org/',
    'https://sso.linuxfoundation.org/',
    'https://evil-linuxfoundation.org/',
    'https://linuxfoundation.org.evil.com/',
    'https://openprofile.dev.evil.com/',
    'not a url',
    'openprofile.dev',
  ])('does not bounce a visitor arriving from %s', async (referer) => {
    await expectNoBounce(navigate('/leaderboards', { referer }));
  });

  it('excludes an Auth0 domain configured with a scheme', async () => {
    runtimeConfig.public.auth0Domain = 'https://sso.linuxfoundation.org';
    try {
      await expectNoBounce(
        navigate('/leaderboards', { referer: 'https://sso.linuxfoundation.org/' }),
      );
    } finally {
      runtimeConfig.public.auth0Domain = 'sso.linuxfoundation.org';
    }
  });

  it('excludes the configured app host', async () => {
    runtimeConfig.public.appUrl = 'https://insights-staging.linuxfoundation.org';
    try {
      await expectNoBounce(
        navigate('/leaderboards', { referer: 'https://insights-staging.linuxfoundation.org/' }),
      );
    } finally {
      runtimeConfig.public.appUrl = 'https://insights.linuxfoundation.org';
    }
  });
});
