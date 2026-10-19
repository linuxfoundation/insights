// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSilentLoginAttempted, login, setSilentLoginAttempted } from './useAuth';

const KEY = 'lfx-silent-login-attempted';

describe('silent login attempt flag (OPS-839)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads true right after an attempt and false once 15 minutes have passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T10:00:00Z'));
    setSilentLoginAttempted(true);

    expect(getSilentLoginAttempted()).toBe(true);

    vi.setSystemTime(new Date('2026-10-19T10:16:00Z'));
    expect(getSilentLoginAttempted()).toBe(false);
  });

  it('reads a legacy "true" value as not attempted', () => {
    localStorage.setItem(KEY, 'true');

    expect(getSilentLoginAttempted()).toBe(false);
  });

  it('removes the key when set to false', () => {
    setSilentLoginAttempted(true);
    setSilentLoginAttempted(false);

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(getSilentLoginAttempted()).toBe(false);
  });
});

describe('login() navigation (OPS-839)', () => {
  const loginEndpoint = vi.fn();
  let location: { href: string };

  beforeEach(() => {
    localStorage.clear();
    loginEndpoint.mockReset();
    loginEndpoint.mockReturnValue({
      success: true,
      authorizationUrl: 'https://auth0.example/authorize',
    });
    registerEndpoint('/api/auth/login', loginEndpoint);
    location = { href: 'http://localhost:3000/' };
    vi.stubGlobal('location', location);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('silent login navigates straight to the endpoint with redirectTo, without a fetch', async () => {
    await login('/project/linux?tab=health', true);

    expect(loginEndpoint).not.toHaveBeenCalled();
    expect(location.href).toBe(
      '/api/auth/login?silent=true&redirectTo=%2Fproject%2Flinux%3Ftab%3Dhealth',
    );
  });

  it('silent login omits redirectTo for the root path', async () => {
    await login('/', true);

    expect(loginEndpoint).not.toHaveBeenCalled();
    expect(location.href).toBe('/api/auth/login?silent=true');
  });

  it('non-silent login still uses $fetch and redirects to the returned URL', async () => {
    await login('/project/linux');

    expect(loginEndpoint).toHaveBeenCalledTimes(1);
    expect(location.href).toBe('https://auth0.example/authorize');
  });
});
