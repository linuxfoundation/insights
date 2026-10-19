// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { defineNuxtPlugin, useAsyncData, useRoute, navigateTo } from 'nuxt/app';
import { watch, nextTick } from 'vue';

import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import {
  authState,
  isAuthLoading,
  isAuthReady,
  setRefreshAuth,
  getSilentLoginAttempted,
  setSilentLoginAttempted,
  isInteractiveLoginStarted,
  login,
  SILENT_LOGIN_ATTEMPTED_KEY,
} from '~~/composables/useAuth';
import { botUserAgentPattern } from '~~/config/bot-user-agent';
import type { AuthData } from '~~/types/auth/auth-user.types';

declare const window: Window & typeof globalThis;

export default defineNuxtPlugin(() => {
  const {
    data: userData,
    refresh: refreshAuth,
    status,
  } = useAsyncData<AuthData>(
    'auth-user',
    () => $fetch('/api/auth/user', { credentials: 'include' }),
    {
      default: () => ({
        isAuthenticated: false,
        user: null,
      }),
      server: false,
      lazy: true,
    },
  );

  setRefreshAuth(refreshAuth);

  let silentLoginStarted = false;
  // A cross-tab re-read only adopts a session, so it can't clobber another tab's pending login
  let syncingFromOtherTab = false;
  // Auth0 just ended the SSO session, so a silent login from the logout landing can only fail
  let isLogoutLanding = new URLSearchParams(window.location.search).get('auth') === 'logout';

  // Framed embeds can't keep the Lax auth cookies cross-site, so the round trip would replace the widget
  const isFramed = window.self !== window.top;
  // Crawler renderers can replay a cached /api/auth/user that still says to log in
  const isBot = botUserAgentPattern.test(navigator.userAgent);

  // Strip ?auth so redirectTo can't accumulate (&auth=success&auth=success…) across silent-login cycles
  const currentPathWithoutAuth = () => {
    const rawUrl = new URL(
      window.location.pathname + window.location.search + window.location.hash,
      window.location.origin,
    );
    rawUrl.searchParams.delete('auth');
    return rawUrl.pathname + (rawUrl.search || '') + (rawUrl.hash || '');
  };

  // A bfcache restore leaves the page as it was mid-redirect, so drop the pending placeholder
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && silentLoginStarted) {
      silentLoginStarted = false;
      isAuthReady.value = true;
      isAuthLoading.value = false;
      // The forward entry may have finished the silent login, so re-read the session
      refreshAuth();
    }
  });

  // Another tab clears the flag once it authenticates, so pick up the shared session cookies
  window.addEventListener('storage', (event) => {
    if (
      event.key === SILENT_LOGIN_ATTEMPTED_KEY &&
      event.newValue === null &&
      !userData.value?.isAuthenticated
    ) {
      syncingFromOtherTab = true;
      refreshAuth();
    }
  });

  // A user who logged in elsewhere while this tab sat in the background gets picked up on return
  // A tab opened in the background never fires the hidden event, so count from load
  let hiddenAt = document.visibilityState === 'hidden' ? Date.now() : 0;
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      return;
    }
    const hiddenFor = hiddenAt ? Date.now() - hiddenAt : 0;
    hiddenAt = 0;
    const isSettled = status.value === 'success' || status.value === 'error';
    if (
      hiddenFor < 10_000 ||
      !isSettled ||
      userData.value?.isAuthenticated ||
      silentLoginStarted ||
      isFramed ||
      isBot ||
      getSilentLoginAttempted(30_000)
    ) {
      return;
    }
    // Re-read first so a session or an interactive login from another tab wins over a new redirect
    syncingFromOtherTab = true;
    await refreshAuth();
    // A failed fetch falls back to anonymous defaults, and an in-tab login predates this read's cookies
    if (
      status.value !== 'success' ||
      isInteractiveLoginStarted() ||
      userData.value?.isAuthenticated ||
      userData.value?.interactiveLoginInFlight ||
      silentLoginStarted ||
      getSilentLoginAttempted(30_000)
    ) {
      return;
    }
    setSilentLoginAttempted(true);
    silentLoginStarted = true;
    login(currentPathWithoutAuth(), true);
  });

  // Watching only the fetch result keeps store writes (logout clearing liked collections) from re-running this
  watch(
    [status, userData],
    () => {
      const isSettled = status.value === 'success' || status.value === 'error';
      if (!userData.value) return;

      isAuthLoading.value = false;
      authState.value = userData.value;

      // Only decide on a settled fetch, so a pending refresh can't act on stale data
      if (
        isSettled &&
        userData.value.shouldAttemptSilentLogin &&
        process.client &&
        !isFramed &&
        !isBot &&
        !syncingFromOtherTab &&
        !isLogoutLanding &&
        !getSilentLoginAttempted()
      ) {
        setSilentLoginAttempted(true);
        silentLoginStarted = true;
        login(currentPathWithoutAuth(), true);
      }
      if (isSettled) {
        syncingFromOtherTab = false;
        isLogoutLanding = false;
      }

      if (userData.value.isAuthenticated) {
        setSilentLoginAttempted(false);

        // Fetch liked collections when user is authenticated
        const collectionsStore = useCollectionsStore();
        if (!collectionsStore.isLikedCollectionsLoaded) {
          collectionsStore.fetchAndSetLikedCollections();
        }
      }

      if (isSettled && !silentLoginStarted) {
        isAuthReady.value = true;
        isAuthLoading.value = false;
      }
    },
    { immediate: true },
  );

  const route = useRoute();

  // The initial /api/auth/user fetch above already reflects the post-callback state
  // (the callback sets/clears cookies before redirecting back), so we don't refetch here.
  // We only clean up the ?auth=logout query param — ?auth=success is left as-is to match prior behavior.
  const handleAuthQuery = async (authParam: string | undefined) => {
    if (authParam === 'logout') {
      await navigateTo('/', { replace: true });
    }
  };

  const runAuthQuery = (authParam: string | undefined) => {
    handleAuthQuery(authParam).catch((error) => {
      console.error('Auth query handling error:', error);
    });
  };

  if (route.query.auth === 'logout') {
    nextTick(() => runAuthQuery(route.query.auth as string | undefined));
  }

  watch(
    () => route.query.auth,
    (authParam) => runAuthQuery(authParam as string | undefined),
  );
});
