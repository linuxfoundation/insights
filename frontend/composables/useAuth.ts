// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { ref, computed } from 'vue';
import { navigateTo, useRoute } from 'nuxt/app';
import { useCollectionsStore } from '~/components/modules/collection/store/collections.store';
import type { AuthData } from '~~/types/auth/auth-user.types';

// Fix for window access in Nuxt
declare const window: Window & typeof globalThis;

export const authState = ref<AuthData>({
  isAuthenticated: false,
  user: null,
  token: null,
});

export const isAuthLoading = ref(false);

// Flips to true once the initial /api/auth/user fetch resolves (success or error).
// Consumers can await this before making auth-gated decisions instead of calling refreshAuth().
export const isAuthReady = ref(false);

let refreshAuthFn: () => Promise<unknown> = async () => {};

export const setRefreshAuth = (fn: () => Promise<unknown>) => {
  refreshAuthFn = fn;
};

// Helper functions for localStorage access with client-side checks
export const getSilentLoginAttempted = (): boolean => {
  if (!process.client) return false;
  return localStorage.getItem('lfx-silent-login-attempted') === 'true';
};

export const setSilentLoginAttempted = (value: boolean): void => {
  if (!process.client) return;
  localStorage.setItem('lfx-silent-login-attempted', value.toString());
};

// TODO: revert this once we have tested the discovery page
export const getWasUserLoggedIn = (): boolean => {
  if (!process.client) return false;
  return localStorage.getItem('lfx-user-logged-in') === 'true';
};

export const setWasUserLoggedIn = (value: boolean): void => {
  if (!process.client) return;
  localStorage.setItem('lfx-user-logged-in', value.toString());
};

export const login = async (redirectTo?: string, silent?: boolean) => {
  isAuthLoading.value = true;
  // Reset silent login flag for next time
  setSilentLoginAttempted(false);
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
    }
  } catch (error) {
    console.error('Login error:', error);
    isAuthLoading.value = false;
  }
};

export const logout = async () => {
  isAuthLoading.value = true;
  // Reset silent login flag for next time
  setSilentLoginAttempted(false);
  try {
    const response = await $fetch<{ success: boolean; logoutUrl: string }>('/api/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      // Clear local state
      authState.value = {
        isAuthenticated: false,
        user: null,
        token: null,
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

      setWasUserLoggedIn(false);
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
  const token = computed(() => authState.value.token);

  return {
    isAuthenticated,
    user,
    token,
    isLoading: isAuthLoading,
    isReady: isAuthReady,
    login,
    logout,
    refreshAuth: () => refreshAuthFn(),
  };
};
