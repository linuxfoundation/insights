// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import { createRouter } from 'radix3';
import cachingConfig from './caching';

describe('caching configuration', () => {
  test('applies no-cache headers only to /api/security/** endpoints', () => {
    const noCacheHeader = 'max-age=0, no-cache, no-store, must-revalidate, s-maxage=0';
    const nitroRules = cachingConfig.nitro.routeRules;

    expect(nitroRules['/api/security/**']?.headers?.['cache-control']).toBe(noCacheHeader);
  });

  test('applies no-cache headers to /api/project/**/security/** endpoints', () => {
    const noCacheHeader = 'max-age=0, no-cache, no-store, must-revalidate, s-maxage=0';
    const nitroRules = cachingConfig.nitro.routeRules;

    expect(nitroRules['/api/project/**/security/**']?.headers?.['cache-control']).toBe(
      noCacheHeader,
    );
  });

  test('nitro route rules do not break sibling /api/project/[slug]/** API routes', () => {
    // A single-segment `*` in a nitro.routeRules pattern collides with the `:slug`
    // param node that Nitro's file-based API routes register in its radix3 router,
    // corrupting lookup for every other route under /api/project/:slug/** (health-score,
    // insights, etc. all return 404 even though the route files exist and are registered).
    const router = createRouter();
    router.insert('/api/project/:slug', { name: 'index' });
    router.insert('/api/project/:slug/overview/health-score', { name: 'health-score' });
    router.insert('/api/project/:slug/security/assessment', { name: 'assessment' });

    Object.keys(cachingConfig.nitro.routeRules).forEach((pattern) => {
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

  test('does not apply no-cache headers to other /api/** routes', () => {
    const nitroRules = cachingConfig.nitro.routeRules;

    // Verify that other /api/** routes (like /api/leaderboard) are not in nitro rules
    // They should fall through to the broader routeRules in the main config
    expect(nitroRules['/api/leaderboard']).toBeUndefined();
    expect(nitroRules['/api/community/list']).toBeUndefined();
    expect(nitroRules['/api/explore/**']).toBeUndefined();
  });

  test('disables prerender for all /api/** routes', () => {
    const nitroRules = cachingConfig.nitro.routeRules;

    expect(nitroRules['/api/**']?.prerender).toBe(false);
    expect(nitroRules['/api/**']?.headers).toBeUndefined();
  });
});
