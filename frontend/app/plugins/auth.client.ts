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
  getWasUserLoggedIn,
  setWasUserLoggedIn,
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
        token: null,
      }),
      server: false,
      lazy: true,
    },
  );

  setRefreshAuth(refreshAuth);

  watch(
    status,
    (s) => {
      if (s === 'success' || s === 'error') {
        isAuthReady.value = true;
        isAuthLoading.value = false;
      }
    },
    { immediate: true },
  );

  watchEffect(() => {
    if (!userData.value) return;

    isAuthLoading.value = false;
    authState.value = userData.value;

    // Attempt silent login if suggested by the server and not already attempted
    if (
      userData.value.shouldAttemptSilentLogin &&
      process.client &&
      !getSilentLoginAttempted() &&
      getWasUserLoggedIn() // Only attempt silent login if the user has logged in previously
    ) {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      login(currentPath, true);
    }

    if (userData.value.isAuthenticated) {
      setSilentLoginAttempted(false);
      setWasUserLoggedIn(true);

      // Fetch liked collections when user is authenticated
      const collectionsStore = useCollectionsStore();
      if (!collectionsStore.isLikedCollectionsLoaded) {
        collectionsStore.fetchAndSetLikedCollections();
      }
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

  if (route.query.auth === 'logout') {
    nextTick(() => handleAuthQuery(route.query.auth as string | undefined));
  }

  watch(
    () => route.query.auth,
    (authParam) => handleAuthQuery(authParam as string | undefined),
  );
});
