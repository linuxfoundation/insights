// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, test } from 'vitest';

describe('robots configuration', () => {
  const originalAppEnv = process.env.NUXT_APP_ENV;

  afterEach(() => {
    process.env.NUXT_APP_ENV = originalAppEnv;
  });

  // robots.ts reads NUXT_APP_ENV at module-eval time, so each env needs a fresh import.
  const loadRobotsConfig = async (appEnv: string) => {
    process.env.NUXT_APP_ENV = appEnv;
    const { default: robotsConfig } = await import(`./robots?env=${appEnv}`);
    return robotsConfig as { disallow: string[] };
  };

  test('keeps crawlers off the login-gated API docs in production', async () => {
    const robots = await loadRobotsConfig('production');

    expect(robots.disallow).toContain('/docs/api/');
  });

  test('leaves the public product docs crawlable in production', async () => {
    const robots = await loadRobotsConfig('production');

    expect(robots.disallow.some((path) => path === '/docs/' || path === '/docs')).toBe(false);
  });
});
