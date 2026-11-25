// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createPinia, setActivePinia } from 'pinia';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { useAuthStore } from '~/components/modules/auth/store/auth.store';

import { useDocsReadinessEnabled } from './useDocsReadinessEnabled';

const publicConfig = vi.hoisted(() => ({ docsReadinessEnabled: false as unknown }));

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRuntimeConfig: () => ({ public: publicConfig }),
}));

const logIn = (hasLfxInsightsPermission: boolean) => {
  useAuthStore().user = { sub: 'auth0|test', hasLfxInsightsPermission };
};

describe('useDocsReadinessEnabled', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    publicConfig.docsReadinessEnabled = false;
  });

  test('flag on + logged out returns true', () => {
    publicConfig.docsReadinessEnabled = true;
    expect(useDocsReadinessEnabled().value).toBe(true);
  });

  test('flag off + logged out returns false', () => {
    expect(useDocsReadinessEnabled().value).toBe(false);
  });

  test('flag off + no permission returns false', () => {
    logIn(false);
    expect(useDocsReadinessEnabled().value).toBe(false);
  });

  test('flag off + permission returns true', () => {
    logIn(true);
    expect(useDocsReadinessEnabled().value).toBe(true);
  });

  // What Nitro yields for the env var set to 1, yes, a value with literal quotes, and empty
  test.each([1, 'yes', 'true', ''])('returns false for non-boolean value %j', (value) => {
    publicConfig.docsReadinessEnabled = value;
    expect(useDocsReadinessEnabled().value).toBe(false);
  });

  test('returns false when the key is missing', () => {
    delete (publicConfig as { docsReadinessEnabled?: unknown }).docsReadinessEnabled;
    expect(useDocsReadinessEnabled().value).toBe(false);
  });

  test('follows the permission when the user logs in', () => {
    const enabled = useDocsReadinessEnabled();
    expect(enabled.value).toBe(false);
    logIn(true);
    expect(enabled.value).toBe(true);
  });
});
