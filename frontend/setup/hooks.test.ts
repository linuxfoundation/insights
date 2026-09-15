// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { describe, test, expect } from 'vitest';
import hooks from './hooks';

describe('nitro:config hook', () => {
  // Regression test for IN-1306: setting nitro.errorHandler as a single string in
  // nuxt.config disables Nuxt's own default error page for every route, not just /_og/,
  // because @nuxt/nitro-server only registers its own handler when nitroConfig.errorHandler
  // is still falsy at hook time. This hook must compose with whatever Nuxt has already set,
  // never replace it.
  test('prepends the OG handler onto an existing errorHandler instead of replacing it', () => {
    const nitroConfig: { errorHandler?: string | string[] } = {
      errorHandler: '/nuxt/default/error/handler.mjs',
    };

    hooks['nitro:config'](nitroConfig);

    expect(nitroConfig.errorHandler).toHaveLength(2);
    expect(nitroConfig.errorHandler?.[0]).toMatch(/og-image-error-handler\.ts$/);
    expect(nitroConfig.errorHandler?.[1]).toBe('/nuxt/default/error/handler.mjs');
  });

  test('still sets the OG handler when no errorHandler was set yet', () => {
    const nitroConfig: { errorHandler?: string | string[] } = {};

    hooks['nitro:config'](nitroConfig);

    expect(nitroConfig.errorHandler).toHaveLength(1);
    expect(nitroConfig.errorHandler?.[0]).toMatch(/og-image-error-handler\.ts$/);
  });
});
