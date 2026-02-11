// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { ref, computed, watchEffect, watch, nextTick } from 'vue';
import { useAsyncData, navigateTo, useRoute } from 'nuxt/app';
import type { AuthData } from '~~/types/auth/auth-user.types';

// Fix for window access in Nuxt
declare const window: Window & typeof globalThis;

const authState = ref<AuthData>({
  isAuthenticated: false,
  user: null,
  token: null,
});

// Helper functions for localStorage access with client-side checks
const getSilentLoginAttempted = (): boolean => {
  if (!process.client) return false;
  return localStorage.getItem('lfx-silent-login-attempted') === 'true';
};

const setSilentLoginAttempted = (value: boolean): void => {
  if (!process.client) return;
  localStorage.setItem('lfx-silent-login-attempted', value.toString());
};

const getWasUserLoggedIn = (): boolean => {
  if (!process.client) return false;
  return localStorage.getItem('lfx-user-logged-in') === 'true';
};

const setWasUserLoggedIn = (value: boolean): void => {
  if (!process.client) return;
  localStorage.setItem('lfx-user-logged-in', value.toString());
};

export const useAuth = () => {
  // Fetch user data from server
  const { data: userData, refresh: refreshAuth } = useAsyncData<AuthData>(
    'auth-user',
    () => $fetch('/api/auth/user', { credentials: 'include' }),
    {
      default: () => ({
        isAuthenticated: false,
        user: null,
        token: null,
      }),
      server: false, // Allow client-side fetching
      lazy: true, // Don't block on initial load
    },
  );

  // Update local state when data changes
  watchEffect(() => {
    if (userData.value) {
      authState.value = userData.value;

      // Attempt silent login if suggested by the server and not already attempted
      if (
        userData.value.shouldAttemptSilentLogin &&
        process.client &&
        !getSilentLoginAttempted() &&
        getWasUserLoggedIn() // Only attempt silent login if the user has logged in previously
      ) {
        const currentPath =
          window.location.pathname + window.location.search + window.location.hash;
        login(currentPath, true);
      }

      if (userData.value.isAuthenticated) {
        setSilentLoginAttempted(false);
        setWasUserLoggedIn(true);
      }
    }
  });

  // Watch for auth success parameter and refresh state
  if (process.client) {
    const route = useRoute();

    // Initial check for auth success
    if (route.query.auth === 'success') {
      nextTick(async () => {
        await refreshAuth();
        // Reset silent login flag when authentication is successful
        setSilentLoginAttempted(false);
      });
    }

    // Watch for route changes
    watch(
      () => route.query.auth,
      async (authParam) => {
        if (authParam === 'success') {
          await refreshAuth();
          // Reset silent login flag when authentication is successful
          setSilentLoginAttempted(false);
        }
      },
    );

    // Check for logout success parameter and refresh state
    if (route.query.auth === 'logout') {
      nextTick(async () => {
        await refreshAuth();
        authState.value = {
          isAuthenticated: false,
          user: null,
          token: null,
        };
        // Clean up the URL by removing the auth parameter
        await navigateTo('/', { replace: true });
      });
    }

    // Watch for logout success parameter
    watch(
      () => route.query.auth,
      async (authParam) => {
        if (authParam === 'logout') {
          await refreshAuth();
          authState.value = {
            isAuthenticated: false,
            user: null,
            token: null,
          };
          // Clean up the URL by removing the auth parameter
          await navigateTo('/', { replace: true });
        }
      },
    );
  }

  const isAuthenticated = computed(() => authState.value.isAuthenticated);
  const user = computed(() => authState.value.user);
  const token = computed(() => authState.value.token);
  const isLoading = ref(false);

  const login = async (redirectTo?: string, silent?: boolean) => {
    isLoading.value = true;
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
      }
    } catch (error) {
      console.error('Login error:', error);
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    // Reset silent login flag for next time
    setSilentLoginAttempted(false);
    try {
      const response = await $fetch<{ success: boolean; logoutUrl: string }>('/api/auth/logout', {
        method: 'POST',
        body: {
          returnTo: window.location.origin + window.location.pathname,
        },
      });

      if (response.success) {
        // Clear local state
        authState.value = {
          isAuthenticated: false,
          user: null,
          token: null,
        };

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
      isLoading.value = false;
    }
  };

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    logout,
    refreshAuth,
  };
};
