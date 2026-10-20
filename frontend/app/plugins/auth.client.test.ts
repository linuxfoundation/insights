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

describe('auth plugin focus check', () => {
  const NOW = new Date('2026-10-19T10:00:00Z').getTime();
  const FRAME_SRC = '/api/auth/login?silent=true&mode=frame';
  let visibility: DocumentVisibilityState = 'visible';

  const refresh = vi.fn();

  type Handlers = {
    focus: EventListener;
    visibility: EventListener;
    message: EventListener;
    pageshow: EventListener;
  };

  const runPlugin = async (
    initial: Record<string, unknown>,
    refreshed = initial,
    refreshedStatus = 'success',
  ): Promise<Handlers> => {
    const addWindowListener = vi.spyOn(window, 'addEventListener');
    const addDocumentListener = vi.spyOn(document, 'addEventListener');
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

    const windowListener = (type: string) =>
      addWindowListener.mock.calls.find(([t]) => (t as string) === type)?.[1] as EventListener;
    const handlers = {
      focus: windowListener('focus'),
      message: windowListener('message'),
      pageshow: windowListener('pageshow'),
      visibility: addDocumentListener.mock.calls.find(
        ([type]) => type === 'visibilitychange',
      )?.[1] as EventListener,
    };
    addWindowListener.mockRestore();
    addDocumentListener.mockRestore();
    return handlers;
  };

  const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };

  // Calls this run's handler directly so listeners left by earlier plugin runs stay out of it
  const focus = async (handlers: Handlers) => {
    handlers.focus(new Event('focus'));
    await flush();
  };

  const frames = () => Array.from(document.querySelectorAll('iframe'));

  const post = (
    handlers: Handlers,
    data: unknown,
    origin = window.location.origin,
    source: unknown = frames()[0]?.contentWindow,
  ) => handlers.message(new MessageEvent('message', { data, origin, source: source as Window }));

  const anonymous = { isAuthenticated: false, user: null, shouldAttemptSilentLogin: false };

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(login).mockClear();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(NOW);
    visibility = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
    vi.spyOn(HTMLIFrameElement.prototype, 'src', 'set').mockImplementation(function (
      this: HTMLIFrameElement,
      value: string,
    ) {
      this.setAttribute('src', value);
    });
    window.history.replaceState(null, '', '/project/linux');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.history.replaceState(null, '', '/');
  });

  it('checks an anonymous tab in exactly one hidden iframe on focus', async () => {
    const handlers = await runPlugin(anonymous);

    await focus(handlers);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(frames()).toHaveLength(1);
    expect(frames()[0]?.getAttribute('src')).toBe(FRAME_SRC);
    expect(frames()[0]?.hidden).toBe(true);
    expect(login).not.toHaveBeenCalled();
    expect(localStorage.getItem(SILENT_LOGIN_ATTEMPTED_KEY)).toBe(String(NOW));
  });

  it('checks when the tab becomes visible, and focus right after adds no second iframe', async () => {
    const handlers = await runPlugin(anonymous);

    handlers.visibility(new Event('visibilitychange'));
    await focus(handlers);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(frames()).toHaveLength(1);
  });

  it('ignores the tab being hidden', async () => {
    const handlers = await runPlugin(anonymous);

    visibility = 'hidden';
    handlers.visibility(new Event('visibilitychange'));
    await flush();

    expect(refresh).not.toHaveBeenCalled();
    expect(frames()).toHaveLength(0);
  });

  it('throttles checks to one per 15 seconds', async () => {
    const handlers = await runPlugin(anonymous);
    await focus(handlers);
    post(handlers, { type: 'insights-sso', result: 'none' });

    vi.setSystemTime(NOW + 14_999);
    await focus(handlers);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(frames()).toHaveLength(0);

    vi.setSystemTime(NOW + 15_000);
    await focus(handlers);
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(frames()).toHaveLength(1);
  });

  it('skips the iframe when another tab attempted silent login under 15s ago', async () => {
    const handlers = await runPlugin(anonymous);
    setSilentLoginAttempted(true);

    await focus(handlers);

    expect(frames()).toHaveLength(0);
  });

  it('ignores focus when already authenticated', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    const handlers = await runPlugin({ isAuthenticated: true, user: { sub: 'u1' } });

    await focus(handlers);

    expect(refresh).not.toHaveBeenCalled();
    expect(frames()).toHaveLength(0);
  });

  it('ignores focus inside a frame', async () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    const handlers = await runPlugin(anonymous);

    await focus(handlers);

    expect(frames()).toHaveLength(0);
  });

  it('ignores focus for a crawler', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    );
    const handlers = await runPlugin(anonymous);

    await focus(handlers);

    expect(frames()).toHaveLength(0);
  });

  it('leaves an interactive login in another tab alone', async () => {
    const handlers = await runPlugin(anonymous, { ...anonymous, interactiveLoginInFlight: true });

    await focus(handlers);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(frames()).toHaveLength(0);
  });

  it('adopts a session another tab finished without an iframe', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    const handlers = await runPlugin(anonymous, { isAuthenticated: true, user: { sub: 'u1' } });

    await focus(handlers);

    expect(frames()).toHaveLength(0);
    expect(authState.value.isAuthenticated).toBe(true);
  });

  it('does not start a full-page silent login from the focus refresh', async () => {
    const handlers = await runPlugin(anonymous, { ...anonymous, shouldAttemptSilentLogin: true });

    await focus(handlers);

    expect(login).not.toHaveBeenCalled();
    expect(frames()).toHaveLength(1);
  });

  it('skips the iframe when the refresh fails', async () => {
    const handlers = await runPlugin(anonymous, anonymous, 'error');

    await focus(handlers);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(frames()).toHaveLength(0);
  });

  it('skips the iframe when this tab starts an interactive login mid-refresh', async () => {
    const actual =
      await vi.importActual<typeof import('~~/composables/useAuth')>('~~/composables/useAuth');
    let rejectFetch: (error: Error) => void = () => {};
    vi.stubGlobal(
      '$fetch',
      vi.fn(() => new Promise((_resolve, reject) => (rejectFetch = reject))),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const handlers = await runPlugin(anonymous);

    handlers.focus(new Event('focus'));
    actual.login('/x');
    await flush();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(frames()).toHaveLength(0);

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
    const handlers = await runPlugin(anonymous);

    actual.login('/x');
    expect(actual.isInteractiveLoginStarted()).toBe(true);

    handlers.pageshow(Object.assign(new Event('pageshow'), { persisted: true }));

    expect(actual.isInteractiveLoginStarted()).toBe(false);

    rejectFetch(new Error('aborted'));
    await flush();
    vi.unstubAllGlobals();
  });

  it('refreshes the session in place when the iframe reports success', async () => {
    vi.mocked(useCollectionsStore).mockReturnValue({
      isLikedCollectionsLoaded: true,
    } as unknown as ReturnType<typeof useCollectionsStore>);
    const handlers = await runPlugin(anonymous);
    await focus(handlers);
    refresh.mockClear();
    expect(frames()[0]?.contentWindow).toBeTruthy();

    post(handlers, { type: 'insights-sso', result: 'success' });
    await flush();

    expect(frames()).toHaveLength(0);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(SILENT_LOGIN_ATTEMPTED_KEY)).toBeNull();
    expect(login).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/project/linux');
  });

  it('removes the iframe without a refresh when the check finds no session', async () => {
    const handlers = await runPlugin(anonymous);
    await focus(handlers);
    refresh.mockClear();

    post(handlers, { type: 'insights-sso', result: 'none' });

    expect(frames()).toHaveLength(0);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('ignores a message from another origin', async () => {
    const handlers = await runPlugin(anonymous);
    await focus(handlers);
    refresh.mockClear();

    post(handlers, { type: 'insights-sso', result: 'success' }, 'https://evil.example');

    expect(frames()).toHaveLength(1);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('ignores a same-origin message from another window', async () => {
    const handlers = await runPlugin(anonymous);
    await focus(handlers);
    refresh.mockClear();

    post(handlers, { type: 'insights-sso', result: 'success' }, window.location.origin, window);

    expect(frames()).toHaveLength(1);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('removes an iframe that never answers after 20 seconds', async () => {
    const handlers = await runPlugin(anonymous);
    await focus(handlers);

    vi.advanceTimersByTime(19_999);
    expect(frames()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(frames()).toHaveLength(0);
  });
});
