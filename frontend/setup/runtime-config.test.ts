// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// @vitest-environment node
import { describe, test, expect, afterEach } from 'vitest';

describe('runtime config', () => {
  const originalAppEnv = process.env.NUXT_APP_ENV;
  const originalFlag = process.env.NUXT_PUBLIC_DOCS_READINESS_ENABLED;

  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };

  afterEach(() => {
    restore('NUXT_APP_ENV', originalAppEnv);
    restore('NUXT_PUBLIC_DOCS_READINESS_ENABLED', originalFlag);
  });

  // runtime-config.ts reads process.env at module-eval time, so each case needs a fresh import
  const loadRuntimeConfig = async (appEnv: string, key: string) => {
    process.env.NUXT_APP_ENV = appEnv;
    const { default: runtimeConfig } = await import(`./runtime-config?env=${key}`);
    return runtimeConfig;
  };

  test('docsReadinessEnabled defaults to false outside production', async () => {
    const config = await loadRuntimeConfig('', 'dev');
    expect(config.public.docsReadinessEnabled).toBe(false);
  });

  test('docsReadinessEnabled defaults to false in production', async () => {
    const config = await loadRuntimeConfig('production', 'production');
    expect(config.public.docsReadinessEnabled).toBe(false);
  });

  test('the default ignores the env var at build time', async () => {
    process.env.NUXT_PUBLIC_DOCS_READINESS_ENABLED = 'true';
    const config = await loadRuntimeConfig('production', 'flag-set');
    expect(config.public.docsReadinessEnabled).toBe(false);
  });
});
