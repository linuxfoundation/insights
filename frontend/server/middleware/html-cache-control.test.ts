// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import { createEvent } from 'h3';
import { describe, expect, it } from 'vitest';

import handler from './html-cache-control';

const NAVIGATION_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

const respond = async (
  accept: string,
  statusCode: number,
  headers: Record<string, string>,
  url = '/',
): Promise<ServerResponse> => {
  const req = new IncomingMessage(new Socket());
  req.url = url;
  req.headers = { accept };
  const res = new ServerResponse(req);
  await handler(createEvent(req, res));
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.writeHead(statusCode);
  return res;
};

describe('html cache-control middleware', () => {
  it('makes browsers revalidate a cached page', async () => {
    const res = await respond(NAVIGATION_ACCEPT, 200, {
      'content-type': 'text/html;charset=utf-8',
      'cache-control': 'max-age=86400',
    });

    expect(res.getHeader('cache-control')).toBe('no-cache');
  });

  it('keeps a 304 from restarting the browser cache window', async () => {
    const res = await respond(NAVIGATION_ACCEPT, 304, {
      'cache-control': 'public, max-age=86400, s-maxage=86400',
    });

    expect(res.getHeader('cache-control')).toBe('no-cache');
  });

  it('keeps no-store on pages that set it', async () => {
    const res = await respond(NAVIGATION_ACCEPT, 302, {
      'content-type': 'text/html',
      'cache-control': 'no-store',
    });

    expect(res.getHeader('cache-control')).toBe('no-store');
  });

  it('leaves a non-HTML response to a navigation alone', async () => {
    const res = await respond(NAVIGATION_ACCEPT, 200, {
      'content-type': 'application/json',
      'cache-control': 'max-age=3600',
    });

    expect(res.getHeader('cache-control')).toBe('max-age=3600');
  });

  it('leaves a 304 from an API route opened in the browser alone', async () => {
    const res = await respond(
      NAVIGATION_ACCEPT,
      304,
      { 'cache-control': 'public, max-age=86400, s-maxage=86400' },
      '/api/project',
    );

    expect(res.getHeader('cache-control')).toBe('public, max-age=86400, s-maxage=86400');
  });

  it('leaves a 304 that declares a non-HTML type alone', async () => {
    const res = await respond(NAVIGATION_ACCEPT, 304, {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=86400, s-maxage=86400',
    });

    expect(res.getHeader('cache-control')).toBe('public, max-age=86400, s-maxage=86400');
  });

  it('leaves data fetches alone', async () => {
    const res = await respond('application/json', 304, {
      'cache-control': 'public, max-age=86400, s-maxage=86400',
    });

    expect(res.getHeader('cache-control')).toBe('public, max-age=86400, s-maxage=86400');
  });
});
