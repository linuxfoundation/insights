// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { defineNuxtPlugin, useAsyncData, useRoute, navigateTo } from 'nuxt/app';
import { watch, watchEffect, nextTick } from 'vue';

import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import {
  authState,
  isAuthLoading,
  isAuthReady,
  setRefreshAuth,
  getSilentLoginAttempted,
  setSilentLoginAttempted,
  login,
} from '~~/composables/useAuth';
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

  watchEffect(() => {
    const isSettled = status.value === 'success' || status.value === 'error';
    if (!userData.value) return;

    isAuthLoading.value = false;
    authState.value = userData.value;

    // Attempt silent login if suggested by the server and not already attempted
    // Framed embeds can't keep the Lax auth cookies cross-site, so the round trip would replace the widget
    const isFramed = window.self !== window.top;
    // Only decide on a settled fetch, so a pending refresh can't act on stale data
    if (
      isSettled &&
      userData.value.shouldAttemptSilentLogin &&
      process.client &&
      !isFramed &&
      !getSilentLoginAttempted()
    ) {
      // Strip the ?auth param before passing the path as redirectTo so it cannot
      // accumulate (&auth=success&auth=success…) across silent-login redirect cycles.
      const rawUrl = new URL(
        window.location.pathname + window.location.search + window.location.hash,
        window.location.origin,
      );
      rawUrl.searchParams.delete('auth');
      const currentPath = rawUrl.pathname + (rawUrl.search || '') + (rawUrl.hash || '');
      setSilentLoginAttempted(true);
      silentLoginStarted = true;
      login(currentPath, true);
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
  });

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
