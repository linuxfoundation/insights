// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getCookie, getHeader, sendRedirect, setResponseHeader, type H3Event } from 'h3';

import { botUserAgentPattern } from '~~/config/bot-user-agent';

import { toSafeRelativePath } from '../utils/redirect';

// Underscore-prefixed segments are framework routes (/_nuxt, /__nuxt_error, /_og, /_ipx, /__sitemap__).
const NON_PAGE_SEGMENTS = new Set(['api', 'auth', 'callback', 'embed', 'docs', 'blog']);

// Sites on the shared LF SSO, whose visitors likely hold an Auth0 session. Others keep the client path to spare LCP.
const LF_SSO_DOMAINS = ['linuxfoundation.org', 'openprofile.dev', 'lfx.dev'];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Insights and the Auth0 host are excluded so auth round trips never bounce again.
function isFromOtherLfSite(event: H3Event): boolean {
  const refererHost = hostOf(getHeader(event, 'referer') ?? '');
  const { appUrl, auth0Domain } = useRuntimeConfig(event).public;
  const excluded = [
    'insights.linuxfoundation.org',
    hostOf(appUrl),
    hostOf(`https://${auth0Domain.replace(/^https?:\/\//, '')}`),
  ];
  if (!refererHost || excluded.includes(refererHost)) return false;
  return LF_SSO_DOMAINS.some((d) => refererHost === d || refererHost.endsWith(`.${d}`));
}

function isPagePath(pathname: string): boolean {
  const segments = pathname.split('/');
  const first = segments[1] ?? '';
  const last = segments[segments.length - 1] ?? '';
  return !first.startsWith('_') && !NON_PAGE_SEGMENTS.has(first) && !/\.[a-z0-9]+$/i.test(last);
}

function shouldBounce(event: H3Event): boolean {
  if (event.method !== 'GET') return false;

  // Only real browsers send fetch metadata, and these values rule out frames, fetches and crawlers.
  if (getHeader(event, 'sec-fetch-mode') !== 'navigate') return false;
  if (getHeader(event, 'sec-fetch-dest') !== 'document') return false;
  const purpose = `${getHeader(event, 'sec-purpose') ?? ''} ${getHeader(event, 'purpose') ?? ''}`;
  if (/prefetch|prerender/i.test(purpose)) return false;

  const userAgent = getHeader(event, 'user-agent') ?? '';
  if (!userAgent.includes('Mozilla') || botUserAgentPattern.test(userAgent)) return false;

  const [pathname = '/', search = ''] = event.path.split('?');
  if (!isPagePath(pathname)) return false;
  if (!isFromOtherLfSite(event)) return false;

  // A refresh token is renewed by /api/auth/user, and auth_pkce means a login is in flight or just failed.
  if (
    getCookie(event, 'insights_oidc_token') ||
    getCookie(event, 'insights_refresh_token') ||
    getCookie(event, 'auth_pkce')
  ) {
    return false;
  }

  const auth = new URLSearchParams(search).getAll('auth');
  return !auth.includes('logout') && !auth.includes('success');
}

// Starts silent SSO before the page renders, so a signed-in Auth0 user never sees an anonymous page reload.
export default defineEventHandler((event) => {
  if (!shouldBounce(event)) return;

  setResponseHeader(event, 'cache-control', 'no-store');
  const redirectTo = encodeURIComponent(toSafeRelativePath(event.path));
  return sendRedirect(event, `/api/auth/login?silent=true&redirectTo=${redirectTo}`, 302);
});
