// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineEventHandler, getRequestHeader } from 'h3';

// The redis page cache (see setup/caching.ts) also hands browsers max-age, which pins old bundles after a deploy
export const HTML_CACHE_CONTROL = 'no-cache';

export default defineEventHandler((event) => {
  if (event.path.startsWith('/api/') || !getRequestHeader(event, 'accept')?.includes('text/html')) {
    return;
  }

  const res = event.node.res;
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = ((statusCode: number, ...args: unknown[]) => {
    const contentType = String(res.getHeader('content-type') ?? '');
    const cacheControl = String(res.getHeader('cache-control') ?? '');
    // A 304 for a cached page carries max-age and no content-type, and would restart the 24h window
    const isPage = contentType.includes('text/html') || (statusCode === 304 && !contentType);
    if (isPage && !cacheControl.includes('no-store')) {
      res.setHeader('cache-control', HTML_CACHE_CONTROL);
    }
    // oxlint-disable-next-line typescript/no-explicit-any
    return (originalWriteHead as any)(statusCode, ...args);
  }) as typeof res.writeHead;
});
