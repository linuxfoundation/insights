// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { defineNuxtPlugin, useAsyncData, useRoute, navigateTo } from 'nuxt/app';
import { watch, watchEffect, nextTick } from 'vue';
import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import {
  authState,
  isAuthLoading,
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
  const { data: userData, refresh: refreshAuth } = useAsyncData<AuthData>(
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

  const handleAuthQuery = async (authParam: string | undefined) => {
    if (authParam === 'success') {
      await refreshAuth();
      setSilentLoginAttempted(false);
    } else if (authParam === 'logout') {
      await refreshAuth();
      authState.value = {
        isAuthenticated: false,
        user: null,
        token: null,
      };
      // Clean up the URL by removing the auth parameter
      await navigateTo('/', { replace: true });
    }
  };

  // Initial check for auth/logout success on first load
  if (route.query.auth === 'success' || route.query.auth === 'logout') {
    nextTick(() => handleAuthQuery(route.query.auth as string | undefined));
  }

  // Watch for subsequent route changes
  watch(
    () => route.query.auth,
    (authParam) => handleAuthQuery(authParam as string | undefined),
  );
});
