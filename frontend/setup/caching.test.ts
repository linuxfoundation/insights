// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import cachingConfig from './caching';

describe('caching configuration', () => {
  test('applies no-cache headers only to /api/security/** endpoints', () => {
    const noCacheHeader = 'max-age=0, no-cache, no-store, must-revalidate, s-maxage=0';
    const nitroRules = cachingConfig.nitro.routeRules;

    expect(nitroRules['/api/security/**']?.headers?.['cache-control']).toBe(noCacheHeader);
  });

  test('applies no-cache headers to /api/project/*/security/** endpoints', () => {
    const noCacheHeader = 'max-age=0, no-cache, no-store, must-revalidate, s-maxage=0';
    const nitroRules = cachingConfig.nitro.routeRules;

    expect(nitroRules['/api/project/*/security/**']?.headers?.['cache-control']).toBe(
      noCacheHeader,
    );
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
