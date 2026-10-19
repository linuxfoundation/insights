// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { useAsyncData } from 'nuxt/app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, reactive, ref } from 'vue';

import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import {
  authState,
  login,
  setSilentLoginAttempted,
  SILENT_LOGIN_ATTEMPTED_KEY,
} from '~~/composables/useAuth';

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

  const refresh = vi.fn();

  const runPlugin = async (
    initial: Record<string, unknown>,
    refreshed = initial,
    refreshedStatus = 'success',
  ) => {
    const addListener = vi.spyOn(document, 'addEventListener');
    const data = ref(initial);
    const status = ref('success');
    refresh.mockReset().mockImplementation(async () => {
      status.value = 'pending';
      await Promise.resolve();
      data.value = refreshed;
      status.value = refreshedStatus;
    });
    vi.mocked(useAsyncData).mockReturnValue({
      data,
      status,
      refresh,
    } as unknown as ReturnType<typeof useAsyncData>);

    (authPlugin as unknown as () => void)();
    await nextTick();

    const call = addListener.mock.calls.find(([type]) => type === 'visibilitychange');
    addListener.mockRestore();
    return call?.[1] as EventListener;
  };

  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  const show = async (handler: EventListener) => {
    visibility = 'visible';
    handler(new Event('visibilitychange'));
    await flush();
  };

  // Calls this run's handler directly so listeners left by earlier plugin runs stay out of it
  const hideFor = async (handler: EventListener, ms: number) => {
    visibility = 'hidden';
    handler(new Event('visibilitychange'));
    vi.setSystemTime(Date.now() + ms);
    await show(handler);
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

    await hideFor(handler, 10_000);

    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith('/project/linux', true);
    expect(localStorage.getItem(SILENT_LOGIN_ATTEMPTED_KEY)).toBe(String(NOW + 10_000));
  });

  it('starts a silent login on return when no attempt is recorded', async () => {
    const handler = await runPlugin(anonymous);

    await hideFor(handler, 10_000);

    expect(login).toHaveBeenCalledTimes(1);
  });

  it('ignores a return after less than 10s hidden', async () => {
    const handler = await runPlugin(anonymous);

    await hideFor(handler, 9_999);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return when the last attempt is under 30s old', async () => {
    const handler = await runPlugin(anonymous);
    setSilentLoginAttempted(true);

    await hideFor(handler, 29_000);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return when already authenticated', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    const handler = await runPlugin({ isAuthenticated: true, user: { sub: 'u1' } });

    await hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
  });

  it('ignores a return inside a frame', async () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    const handler = await runPlugin(anonymous);

    await hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
  });

  it('starts a silent login on the first return of a page that loaded hidden', async () => {
    visibility = 'hidden';
    const handler = await runPlugin(anonymous);
    vi.setSystemTime(NOW + 10_000);

    await show(handler);

    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith('/project/linux', true);
  });

  it('re-reads the session and starts exactly one silent login when still anonymous', async () => {
    const handler = await runPlugin(anonymous, { ...anonymous, shouldAttemptSilentLogin: true });

    await hideFor(handler, 60_000);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith('/project/linux', true);
  });

  it('leaves an interactive login in another tab alone', async () => {
    const handler = await runPlugin(anonymous, { ...anonymous, interactiveLoginInFlight: true });

    await hideFor(handler, 60_000);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(login).not.toHaveBeenCalled();
  });

  it('adopts a session another tab finished without bouncing', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    const handler = await runPlugin(anonymous, { isAuthenticated: true, user: { sub: 'u1' } });

    await hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
    expect(authState.value.isAuthenticated).toBe(true);
  });

  it('skips the silent login when the refresh fails', async () => {
    const handler = await runPlugin(anonymous, anonymous, 'error');

    await hideFor(handler, 60_000);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(login).not.toHaveBeenCalled();
  });

  it('skips the silent login when this tab starts an interactive login mid-refresh', async () => {
    const actual =
      await vi.importActual<typeof import('~~/composables/useAuth')>('~~/composables/useAuth');
    let rejectFetch: (error: Error) => void = () => {};
    vi.stubGlobal(
      '$fetch',
      vi.fn(() => new Promise((_resolve, reject) => (rejectFetch = reject))),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = await runPlugin(anonymous);

    visibility = 'hidden';
    handler(new Event('visibilitychange'));
    vi.setSystemTime(Date.now() + 60_000);
    visibility = 'visible';
    handler(new Event('visibilitychange'));
    actual.login('/x');
    await flush();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(login).not.toHaveBeenCalled();

    // A failed interactive login clears the flag, so later tests start clean
    rejectFetch(new Error('aborted'));
    await flush();
    vi.unstubAllGlobals();
  });

  it('clears an unfinished interactive login when the page is restored from bfcache', async () => {
    const actual =
      await vi.importActual<typeof import('~~/composables/useAuth')>('~~/composables/useAuth');
    let rejectFetch: (error: Error) => void = () => {};
    vi.stubGlobal(
      '$fetch',
      vi.fn(() => new Promise((_resolve, reject) => (rejectFetch = reject))),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const addWindowListener = vi.spyOn(window, 'addEventListener');
    await runPlugin(anonymous);
    const pageshow = addWindowListener.mock.calls.find(
      ([type]) => (type as string) === 'pageshow',
    )?.[1] as EventListener | undefined;

    actual.login('/x');
    expect(actual.isInteractiveLoginStarted()).toBe(true);

    pageshow?.(Object.assign(new Event('pageshow'), { persisted: true }));

    expect(actual.isInteractiveLoginStarted()).toBe(false);

    rejectFetch(new Error('aborted'));
    await flush();
    vi.unstubAllGlobals();
  });

  it('ignores a return for a crawler', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    );
    const handler = await runPlugin(anonymous);

    await hideFor(handler, 60_000);

    expect(login).not.toHaveBeenCalled();
  });
});
