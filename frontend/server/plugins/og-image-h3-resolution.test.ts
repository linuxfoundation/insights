// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createRequire } from 'node:module';
import { describe, it, expect } from 'vitest';

// IN-1275: nuxt-og-image's compiled code imports `getQuery`/`createError` from `h3`
// without declaring `h3` as its own package.json dependency. pnpm therefore has no
// fixed slot to resolve that import into, and (absent the packageExtensions/overrides
// fix in pnpm-workspace.yaml) can resolve it to h3 v2 instead of the app's h3 v1.
// h3 v2's getQuery does `new URL(event.req.url)`, which throws `TypeError: Invalid URL`
// for a real Node request whose `req.url` is a relative path (e.g. an OG-image request
// carrying HubSpot tracking params like __hstc/__hssc/__hsfp) — this was the exact
// cause of the raw 500s reported in IN-1275. h3 v1's getQuery has no such requirement.
//
// This test resolves `h3` the same way nuxt-og-image's own code resolves it (Node
// module resolution from nuxt-og-image's package), so it reflects whatever pnpm
// actually links today rather than asserting a version number.
describe('nuxt-og-image h3 resolution (IN-1275)', () => {
  it('does not throw when reading query params from a real OG-image request', async () => {
    const nuxtOgImageEntry = import.meta.resolve('nuxt-og-image');
    const requireFromNuxtOgImage = createRequire(nuxtOgImageEntry);
    const h3 = requireFromNuxtOgImage(requireFromNuxtOgImage.resolve('h3'));

    // Shape of a real Node request as seen by Nitro: `url` is a relative path,
    // not an absolute URL.
    const nodeReq = {
      url: '/__og-image__/image/project/test-project/og.png?__hstc=1&__hssc=2&__hsfp=3',
      method: 'GET',
      headers: {},
    };
    const nodeRes = { getHeader() {}, setHeader() {}, end() {}, writeHead() {}, once() {} };

    // fails before fix: with h3 v2 resolved, constructing the event (or calling
    // getQuery) throws `TypeError: Invalid URL` for this relative req.url.
    expect(() => {
      const event = h3.createEvent ? h3.createEvent(nodeReq, nodeRes) : new h3.H3Event(nodeReq);
      h3.getQuery(event);
    }).not.toThrow();
  });
});
