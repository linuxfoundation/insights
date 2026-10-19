// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSilentLoginAttempted, login, logout, setSilentLoginAttempted } from './useAuth';

const KEY = 'lfx-silent-login-attempted';

describe('silent login attempt flag', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads true just under 2 minutes after an attempt and false at 2 minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T10:00:00Z'));
    setSilentLoginAttempted(true);

    vi.setSystemTime(new Date('2026-10-19T10:01:59Z'));
    expect(getSilentLoginAttempted()).toBe(true);

    vi.setSystemTime(new Date('2026-10-19T10:02:00Z'));
    expect(getSilentLoginAttempted()).toBe(false);
  });

  it('checks a custom window when one is given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T10:00:00Z'));
    setSilentLoginAttempted(true);

    vi.setSystemTime(new Date('2026-10-19T10:00:29Z'));
    expect(getSilentLoginAttempted(30_000)).toBe(true);

    vi.setSystemTime(new Date('2026-10-19T10:00:30Z'));
    expect(getSilentLoginAttempted(30_000)).toBe(false);
    expect(getSilentLoginAttempted()).toBe(true);
  });

  it('reads a future timestamp as not attempted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T10:00:00Z'));
    localStorage.setItem(KEY, new Date('2026-10-19T11:00:00Z').getTime().toString());

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

  it('treats blocked storage as attempted and does not throw', () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

    expect(() => setSilentLoginAttempted(true)).not.toThrow();
    expect(getSilentLoginAttempted()).toBe(true);

    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('login() navigation', () => {
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

describe('logout()', () => {
  let location: { href: string };

  beforeEach(() => {
    localStorage.clear();
    registerEndpoint('/api/auth/logout', {
      method: 'POST',
      handler: () => ({ success: true, logoutUrl: '/?auth=logout' }),
    });
    location = { href: 'http://localhost:3000/' };
    vi.stubGlobal('location', location);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leaves no silent login flag so a later load can pick up a new SSO session', async () => {
    await logout();

    expect(location.href).toBe('/?auth=logout');
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
