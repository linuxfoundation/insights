// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { navigateTo, useRoute } from 'nuxt/app';
import { ref, computed } from 'vue';

import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import type { AuthData } from '~~/types/auth/auth-user.types';

// Fix for window access in Nuxt
declare const window: Window & typeof globalThis;

export const authState = ref<AuthData>({
  isAuthenticated: false,
  user: null,
});

export const isAuthLoading = ref(false);

// Flips to true once the initial /api/auth/user fetch resolves (success or error).
// Consumers can await this before making auth-gated decisions instead of calling refreshAuth().
export const isAuthReady = ref(false);

let refreshAuthFn: () => Promise<unknown> = async () => {};

export const setRefreshAuth = (fn: () => Promise<unknown>) => {
  refreshAuthFn = fn;
};

export const SILENT_LOGIN_ATTEMPTED_KEY = 'lfx-silent-login-attempted';
// Matches the silent auth_pkce cookie maxAge in server/api/auth/login.get.ts
const SILENT_LOGIN_ATTEMPT_TTL_MS = 2 * 60 * 1000;

// Stores attempt time so failed silent logins retry after the TTL; legacy 'true' reads as not attempted
export const getSilentLoginAttempted = (withinMs = SILENT_LOGIN_ATTEMPT_TTL_MS): boolean => {
  if (!process.client) return false;
  try {
    const attemptedAt = Number(localStorage.getItem(SILENT_LOGIN_ATTEMPTED_KEY));
    const age = Date.now() - attemptedAt;
    return age >= 0 && age < withinMs;
  } catch {
    // Blocked storage can't record attempts, so report one to avoid retrying every load
    return true;
  }
};

export const setSilentLoginAttempted = (value: boolean): void => {
  if (!process.client) return;
  try {
    if (value) {
      localStorage.setItem(SILENT_LOGIN_ATTEMPTED_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(SILENT_LOGIN_ATTEMPTED_KEY);
    }
  } catch {
    // Storage blocked or full; the server-side auth_pkce cookie still limits retries
  }
};

// Set for the rest of the page once an explicit login starts, so a tab-return retry can't overwrite its auth_pkce
let interactiveLoginStarted = false;
export const isInteractiveLoginStarted = () => interactiveLoginStarted;

export const login = async (redirectTo?: string, silent?: boolean) => {
  isAuthLoading.value = true;
  // Explicit logins clear the flag; silent ones keep it so a failed attempt waits out the TTL
  if (!silent) {
    setSilentLoginAttempted(false);
    interactiveLoginStarted = true;
  }
  try {
    let currentPath = redirectTo || '/';

    if (!redirectTo && process.client) {
      try {
        const route = useRoute();
        currentPath = route.fullPath || '/';
      } catch {
        currentPath = '/';
      }
    }

    // Silent login navigates straight to the endpoint, which redirects to Auth0 (skips the JSON hop)
    if (silent && process.client) {
      const params = new URLSearchParams({ silent: 'true' });
      if (currentPath !== '/') params.set('redirectTo', currentPath);
      window.location.href = `/api/auth/login?${params.toString()}`;
      return;
    }

    // Call the login API endpoint to get the Auth0 authorization URL
    const response = await $fetch<{ success: boolean; authorizationUrl: string }>(
      '/api/auth/login',
      {
        method: 'GET',
        query: currentPath !== '/' ? { redirectTo: currentPath, silent } : { silent },
        credentials: 'include',
      },
    );

    if (response.success && response.authorizationUrl) {
      // Redirect to Auth0 using the returned URL
      if (process.client) {
        window.location.href = response.authorizationUrl;
      } else {
        await navigateTo(response.authorizationUrl, { external: true });
      }
    } else {
      isAuthLoading.value = false;
      interactiveLoginStarted = false;
    }
  } catch (error) {
    console.error('Login error:', error);
    isAuthLoading.value = false;
    interactiveLoginStarted = false;
  }
};

export const logout = async () => {
  isAuthLoading.value = true;
  try {
    const response = await $fetch<{ success: boolean; logoutUrl: string }>('/api/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      // Clear local state
      authState.value = {
        isAuthenticated: false,
        user: null,
      };

      // Clear liked collections
      const collectionsStore = useCollectionsStore();
      collectionsStore.clearLikedCollections();

      // Redirect to Auth0 logout or home
      if (process.client) {
        window.location.href = response.logoutUrl;
      } else {
        await navigateTo(response.logoutUrl, { external: true });
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    isAuthLoading.value = false;
  }
};

export const useAuth = () => {
  const isAuthenticated = computed(() => authState.value.isAuthenticated);
  const user = computed(() => authState.value.user);

  return {
    isAuthenticated,
    user,
    isLoading: isAuthLoading,
    isReady: isAuthReady,
    login,
    logout,
    refreshAuth: () => refreshAuthFn(),
  };
};
