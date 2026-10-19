// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { useAsyncData } from 'nuxt/app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, reactive, ref } from 'vue';

import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import { login, setSilentLoginAttempted, SILENT_LOGIN_ATTEMPTED_KEY } from '~~/composables/useAuth';

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

describe('auth plugin after logout', () => {
  const runPlugin = async (initial: Record<string, unknown>) => {
    vi.mocked(useAsyncData).mockReturnValue({
      data: ref(initial),
      status: ref('success'),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useAsyncData>);

    (authPlugin as unknown as () => void)();
    await nextTick();
  };

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(login).mockClear();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('does not start a silent login on the logout landing', async () => {
    window.history.replaceState(null, '', '/?auth=logout');

    await runPlugin({ isAuthenticated: false, user: null, shouldAttemptSilentLogin: true });

    expect(login).not.toHaveBeenCalled();
  });

  it('keeps the flag and skips the refetch when liked collections are cleared', async () => {
    const store = reactive({
      isLikedCollectionsLoaded: true,
      fetchAndSetLikedCollections: vi.fn(),
    });
    vi.mocked(useCollectionsStore).mockReturnValue(
      store as unknown as ReturnType<typeof useCollectionsStore>,
    );
    await runPlugin({ isAuthenticated: true, user: { sub: 'u1' } });

    setSilentLoginAttempted(true);
    store.isLikedCollectionsLoaded = false;
    await nextTick();

    expect(localStorage.getItem(SILENT_LOGIN_ATTEMPTED_KEY)).not.toBeNull();
    expect(store.fetchAndSetLikedCollections).not.toHaveBeenCalled();
  });
});

describe('auth plugin tab return', () => {
  const NOW = new Date('2026-10-19T10:00:00Z').getTime();
  let visibility: DocumentVisibilityState = 'visible';

  const runPlugin = async (initial: Record<string, unknown>) => {
    const addListener = vi.spyOn(document, 'addEventListener');
    vi.mocked(useAsyncData).mockReturnValue({
      data: ref(initial),
      status: ref('success'),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useAsyncData>);

    (authPlugin as unknown as () => void)();
    await nextTick();

    const call = addListener.mock.calls.find(([type]) => type === 'visibilitychange');
    addListener.mockRestore();
    return call?.[1] as EventListener;
  };

  // Calls this run's handler directly so listeners left by earlier plugin runs stay out of it
  const hideFor = (handler: EventListener, ms: number) => {
    visibility = 'hidden';
    handler(new Event('visibilitychange'));
    vi.setSystemTime(Date.now() + ms);
    visibility = 'visible';
    handler(new Event('visibilitychange'));
  };

  const anonymous = { isAuthenticated: false, user: null, shouldAttemptSilentLogin: false };

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(login).mockClear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    visibility = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
    window.history.replaceState(null, '', '/project/linux');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('starts one silent login after 10s hidden when the last attempt is old', async () => {
    vi.setSystemTime(NOW - 60_000);
    setSilentLoginAttempted(true);
    vi.setSystemTime(NOW);
    const handler = await runPlugin(anonymous);

    hideFor(handler, 10_000);

    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith('/project/linux', true);
    expect(localStorage.getItem(SILENT_LOGIN_ATTEMPTED_KEY)).toBe(String(NOW + 10_000));
  });

  it('starts a silent login on return when no attempt is recorded', async () => {
    const handler = await runPlugin(anonymous);

    hideFor(handler, 10_000);

    expect(login).toHaveBeenCalledTimes(1);
  });

  it('ignores a return after less than 10s hidden', async () => {
    const handler = await runPlugin(anonymous);

    hideFor(handler, 9_999);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return when the last attempt is under 30s old', async () => {
    const handler = await runPlugin(anonymous);
    setSilentLoginAttempted(true);

    hideFor(handler, 29_000);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return when already authenticated', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    const handler = await runPlugin({ isAuthenticated: true, user: { sub: 'u1' } });

    hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return inside a frame', async () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    const handler = await runPlugin(anonymous);

    hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return for a crawler', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    );
    const handler = await runPlugin(anonymous);

    hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
  });
});
