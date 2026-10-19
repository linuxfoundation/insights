// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { useAsyncData } from 'nuxt/app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import { login, SILENT_LOGIN_ATTEMPTED_KEY } from '~~/composables/useAuth';

import authPlugin from './auth.client';

vi.mock('nuxt/app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('nuxt/app')>()),
  defineNuxtPlugin: (plugin: unknown) => plugin,
  useAsyncData: vi.fn(),
  useRoute: () => ({ query: {} }),
  navigateTo: vi.fn(),
}));

vi.mock('~~/composables/useAuth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~~/composables/useAuth')>()),
  login: vi.fn(),
}));

vi.mock('~/components/modules/collection/store/collections.store', () => ({
  useCollectionsStore: vi.fn(),
}));

const runPluginWithUserAgent = async (userAgent: string) => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  vi.mocked(useAsyncData).mockReturnValue({
    data: ref({ isAuthenticated: false, user: null, shouldAttemptSilentLogin: true }),
    status: ref('success'),
    refresh: vi.fn(),
  } as unknown as ReturnType<typeof useAsyncData>);

  (authPlugin as unknown as () => void)();
  await nextTick();
};

describe('auth plugin silent login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(login).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts silent login for a browser the server flagged', async () => {
    await runPluginWithUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    );

    expect(login).toHaveBeenCalledWith('/', true);
  });

  it('skips silent login for a crawler even when the server flagged it', async () => {
    await runPluginWithUserAgent(
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
    );

    expect(login).not.toHaveBeenCalled();
  });
});

describe('auth plugin cross-tab sync', () => {
  const data = ref<Record<string, unknown>>({});
  const status = ref('success');
  const refresh = vi.fn(() => {
    status.value = 'pending';
    return Promise.resolve();
  });

  const runPlugin = async (initial: Record<string, unknown>) => {
    data.value = initial;
    status.value = 'success';
    vi.mocked(useAsyncData).mockReturnValue({
      data,
      status,
      refresh,
    } as unknown as ReturnType<typeof useAsyncData>);

    (authPlugin as unknown as () => void)();
    await nextTick();
  };

  const dispatchFlagChange = (newValue: string | null) => {
    window.dispatchEvent(
      new StorageEvent('storage', { key: SILENT_LOGIN_ATTEMPTED_KEY, newValue }),
    );
  };

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(login).mockClear();
    refresh.mockClear();
  });

  it('re-reads the session when another tab clears the flag', async () => {
    await runPlugin({ isAuthenticated: false, user: null, shouldAttemptSilentLogin: false });

    dispatchFlagChange(null);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('ignores another tab setting the flag', async () => {
    await runPlugin({ isAuthenticated: false, user: null, shouldAttemptSilentLogin: false });

    dispatchFlagChange(Date.now().toString());

    expect(refresh).not.toHaveBeenCalled();
  });

  it('ignores the flag clearing when already authenticated', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    await runPlugin({ isAuthenticated: true, user: { sub: 'u1' } });

    dispatchFlagChange(null);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('does not start a silent login from the cross-tab refresh', async () => {
    await runPlugin({ isAuthenticated: false, user: null, shouldAttemptSilentLogin: false });

    dispatchFlagChange(null);
    await nextTick();
    data.value = { isAuthenticated: false, user: null, shouldAttemptSilentLogin: true };
    status.value = 'success';
    await nextTick();

    expect(login).not.toHaveBeenCalled();
  });
});
