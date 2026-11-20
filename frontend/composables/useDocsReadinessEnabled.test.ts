// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { useDocsReadinessEnabled } from './useDocsReadinessEnabled';

const publicConfig = vi.hoisted(() => ({ docsReadinessEnabled: false as unknown }));

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  useRuntimeConfig: () => ({ public: publicConfig }),
}));

describe('useDocsReadinessEnabled', () => {
  beforeEach(() => {
    publicConfig.docsReadinessEnabled = false;
  });

  test('returns false when the flag is false', () => {
    expect(useDocsReadinessEnabled()).toBe(false);
  });

  test('returns true when the flag is boolean true', () => {
    publicConfig.docsReadinessEnabled = true;
    expect(useDocsReadinessEnabled()).toBe(true);
  });

  // What Nitro yields for the env var set to 1, yes, a value with literal quotes, and empty
  test.each([1, 'yes', 'true', ''])('returns false for non-boolean value %j', (value) => {
    publicConfig.docsReadinessEnabled = value;
    expect(useDocsReadinessEnabled()).toBe(false);
  });

  test('returns false when the key is missing', () => {
    delete (publicConfig as { docsReadinessEnabled?: unknown }).docsReadinessEnabled;
    expect(useDocsReadinessEnabled()).toBe(false);
  });
});
