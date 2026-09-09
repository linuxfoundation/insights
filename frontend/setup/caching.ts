// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createRequire } from 'node:module';

const longCache = 86400; // 1 day in seconds
const shortCache = 3600; // 1 hour in seconds

const redisUrl = process.env.NUXT_REDIS_URL || '';

const cacheMountTtl = 60 * 60 * 24 * 3;

// satori >=0.33 shapes text with harfbuzzjs, whose emscripten glue loads hb.wasm through a
// computed path (locateFile) that the file tracer cannot follow, so the production server 500s
// on every OG render with ENOENT hb.wasm. Resolve the file through satori's own dependency
// chain (pnpm does not hoist it to the project root) and hand it to the tracer explicitly.
const resolveFromRoot = createRequire(import.meta.url);
const harfbuzzWasm = createRequire(resolveFromRoot.resolve('satori')).resolve('harfbuzzjs/hb.wasm');

// Production runs on node:24-slim (Debian, glibc) — only the linux-x64-gnu native
// binary is ever loaded at runtime. Nitro's dependency tracer (nitropack >=2.13)
// full-traces every @resvg/resvg-js-* platform package it finds (Windows/macOS/
// Android/musl included), ballooning the server bundle from ~80MB to ~440MB.
// Known upstream issue: https://github.com/nuxt-modules/og-image/issues/412
// @temporalio/client's CommonJS entry carries an `import ... from` usage sample inside its JSDoc.
// Nitro's ESM/CJS sniffing (mlly isValidNodeImport) reads that as mixed syntax and inlines the
// package, which leaves extensionless `lib/*` imports that fail at startup. Keep it external
// (rollupConfig.external below) and trace it by hand so it still ships in .output/server.
const manuallyTracedPackages = ['@temporalio/client'];

const externals = {
  // Absolute paths: rollup reports the bare ids above as external without resolving them, and
  // the tracer needs real files.
  traceInclude: [harfbuzzWasm, ...manuallyTracedPackages.map((id) => resolveFromRoot.resolve(id))],
  traceOptions: {
    ignore: [
      '**/node_modules/@resvg/resvg-js-android-arm-eabi/**',
      '**/node_modules/@resvg/resvg-js-android-arm64/**',
      '**/node_modules/@resvg/resvg-js-darwin-arm64/**',
      '**/node_modules/@resvg/resvg-js-darwin-x64/**',
      '**/node_modules/@resvg/resvg-js-linux-arm-gnueabihf/**',
      '**/node_modules/@resvg/resvg-js-linux-arm64-musl/**',
      '**/node_modules/@resvg/resvg-js-linux-x64-musl/**',
      '**/node_modules/@resvg/resvg-js-win32-arm64-msvc/**',
      '**/node_modules/@resvg/resvg-js-win32-ia32-msvc/**',
      '**/node_modules/@resvg/resvg-js-win32-x64-msvc/**',
    ],
  },
};

// A single-segment `*` in these patterns collides with the `:slug` param node that the real
// `/api/project/[slug]/**` API routes register in Nitro's radix3 router, corrupting route
// resolution for every route under `/api/project/:slug/**`. `**` matches one-or-more segments
// without introducing a conflicting node type.
const noCacheHeaders = {
  'cache-control': 'max-age=0, no-cache, no-store, must-revalidate, s-maxage=0',
};

export default {
  routeRules: {
    '/auth/callback': { redirect: '/api/auth/callback' },
    '/callback': { redirect: '/api/auth/callback' },
    '/api/auth/**': { prerender: false, index: false, cache: false },
    '/_og/**': { cache: false },
    // These three apply regardless of NUXT_APP_ENV (they used to live in nitro.routeRules,
    // applied unconditionally). Keep them out of the production-only block below, and never
    // repeat their keys there — a route rule declared in two places for the same exact
    // pattern doesn't merge, the later one replaces the earlier one wholesale. That's how
    // `/api/security/**`'s `cache: false` got silently dropped, leaving the route to fall
    // through to the `/**` catch-all's redis cache, which wraps this POST handler in Nitro's
    // cachedEventHandler and strips the request body.
    '/api/**': {
      prerender: false,
      ...(process.env.NUXT_APP_ENV === 'production'
        ? { cache: { maxAge: shortCache, base: 'redis' } }
        : {}),
    },
    '/api/security/**': { cache: false, headers: noCacheHeaders, prerender: false },
    '/api/project/**/security/**': { headers: noCacheHeaders, prerender: false },
    ...(process.env.NUXT_APP_ENV === 'production'
      ? {
          '/api/health': { cache: false },
          '/api/chat/**': { cache: false },
          '/api/health/live': { cache: false },
          '/api/health/ready': { cache: false },
          '/api/report': { cache: false },
          '/api/report/cncf/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/report/ai-code-tracker/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/report/cncf': { cache: { maxAge: longCache, base: 'redis' } },
          '/report/ai-code-tracker': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/collection': { cache: false },
          '/api/collection/**': { cache: false },
          '/api/community/list': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/community/**': { cache: false },
          '/api/search': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/category': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/explore/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/leaderboard': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/leaderboard/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/project': { cache: { maxAge: longCache, base: 'redis' } },
          '/api/project/collections': { cache: false },
          '/api/repository/collections': { cache: false },
          '/api/ossindex': { cache: { maxAge: longCache, base: 'redis' } },
          '/leaderboard': { cache: { maxAge: longCache, base: 'redis' } },
          '/leaderboard/**': { cache: { maxAge: longCache, base: 'redis' } },
          '/project/**': { cache: false },
          '/collection/**': { cache: false },
          '/collection': { cache: false },
          '**': { cache: { maxAge: longCache, base: 'redis' } },
        }
      : {}),
  },
  nitro: {
    externals,
    rollupConfig: { external: manuallyTracedPackages },
    storage: {
      redis: {
        driver: 'redis',
        url: redisUrl,
      },
      // Nitro's default cache base (`/cache/**`) is unmounted, so it falls back to an
      // in-memory driver that nuxt-og-image fills with rendered images and never evicts.
      // Mounting it on Redis moves that store off the heap, with a ttl to bound it there.
      ...(redisUrl
        ? {
            cache: {
              driver: 'redis',
              url: redisUrl,
              base: 'nitro-cache',
              ttl: cacheMountTtl,
            },
          }
        : {}),
    },
  },
};
