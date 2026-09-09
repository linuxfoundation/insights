// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, afterEach } from 'vitest';
import { createRouter } from 'radix3';

const noCacheHeader = 'max-age=0, no-cache, no-store, must-revalidate, s-maxage=0';

describe('caching configuration', () => {
  const originalAppEnv = process.env.NUXT_APP_ENV;

  afterEach(() => {
    process.env.NUXT_APP_ENV = originalAppEnv;
  });

  // caching.ts reads process.env.NUXT_APP_ENV at module-eval time, so each test that needs a
  // specific env must set it before a fresh dynamic import (vi.resetModules keeps the cache
  // from serving a stale, already-evaluated config).
  const loadCachingConfig = async (appEnv: string) => {
    process.env.NUXT_APP_ENV = appEnv;
    const { default: cachingConfig } = await import(`./caching?env=${appEnv}`);
    return cachingConfig;
  };

  test('applies no-cache headers and disables cache for /api/security/** in production', async () => {
    const cachingConfig = await loadCachingConfig('production');
    const rule = cachingConfig.routeRules['/api/security/**'];

    // Regression test for DE-1044: this route used to be declared both here and in a separate
    // nitro.routeRules block. Nuxt/Nitro doesn't merge two rules for the same exact pattern —
    // the later one replaces the earlier wholesale — so `cache: false` was silently dropped,
    // the route fell through to the `/**` catch-all's redis cache, and Nitro's
    // cachedEventHandler wrapper stripped the POST request body before the handler ever saw it.
    expect(rule?.cache).toBe(false);
    expect(rule?.headers?.['cache-control']).toBe(noCacheHeader);
    expect(rule?.prerender).toBe(false);
  });

  test('applies no-cache headers to /api/project/**/security/** endpoints', async () => {
    const cachingConfig = await loadCachingConfig('production');
    const rule = cachingConfig.routeRules['/api/project/**/security/**'];

    expect(rule?.headers?.['cache-control']).toBe(noCacheHeader);
  });

  test('nitro route rules do not break sibling /api/project/[slug]/** API routes', async () => {
    // A single-segment `*` in a routeRules pattern collides with the `:slug` param node that
    // Nitro's file-based API routes register in its radix3 router, corrupting lookup for every
    // other route under /api/project/:slug/** (health-score, insights, etc. all return 404 even
    // though the route files exist and are registered).
    const cachingConfig = await loadCachingConfig('production');
    const router = createRouter();
    router.insert('/api/project/:slug', { name: 'index' });
    router.insert('/api/project/:slug/overview/health-score', { name: 'health-score' });
    router.insert('/api/project/:slug/security/assessment', { name: 'assessment' });

    Object.keys(cachingConfig.routeRules).forEach((pattern) => {
      router.insert(pattern, { name: `rule:${pattern}` });
    });

    expect(router.lookup('/api/project/k8s')).toMatchObject({ name: 'index' });
    expect(router.lookup('/api/project/k8s/overview/health-score')).toMatchObject({
      name: 'health-score',
    });
    expect(router.lookup('/api/project/k8s/security/assessment')).toMatchObject({
      name: 'assessment',
    });
  });

  test('does not apply redis caching to other /api/** routes with their own no-cache rule', async () => {
    const cachingConfig = await loadCachingConfig('production');
    const nitroRules = cachingConfig.routeRules;

    expect(nitroRules['/api/collection']?.cache).toBe(false);
    expect(nitroRules['/api/community/**']?.cache).toBe(false);
  });

  test('disables prerender for all /api/** routes regardless of environment', async () => {
    const prod = await loadCachingConfig('production');
    expect(prod.routeRules['/api/**']?.prerender).toBe(false);

    const dev = await loadCachingConfig('development');
    expect(dev.routeRules['/api/**']?.prerender).toBe(false);
    expect(dev.routeRules['/api/**']?.cache).toBeUndefined();
  });

  test('every route rule pattern is declared exactly once', async () => {
    // Guards against reintroducing the DE-1044 bug: a pattern split across two config sources
    // (or duplicated within this one) has its rule silently replaced instead of merged.
    const path = await import('node:path');
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(path.join(__dirname, 'caching.ts'), 'utf-8'),
    );
    const patternKeys = [...source.matchAll(/^\s*'([^']+)':\s*\{/gm)].map((m) => m[1]);
    const duplicates = patternKeys.filter((key, i) => patternKeys.indexOf(key) !== i);

    expect(duplicates).toEqual([]);
  });
});
