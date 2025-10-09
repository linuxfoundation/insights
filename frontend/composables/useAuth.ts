// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { ref, computed, watchEffect, watch, nextTick } from 'vue'
import { useAsyncData, navigateTo, useRoute } from 'nuxt/app'
import type { AuthData } from '~~/types/auth/auth-user.types'

// Fix for window access in Nuxt
declare const window: Window & typeof globalThis

const authState = ref<AuthData>({
  isAuthenticated: false,
  user: null,
  token: null,
})

// Track last silent login attempt to prevent too frequent attempts
let lastSilentLoginAttempt = 0
const SILENT_LOGIN_COOLDOWN = 30000 // 30 seconds

// Track if silent login has already been attempted to prevent multiple executions
let silentLoginAttempted = false

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
  )

  // Update local state when data changes
  watchEffect(() => {
    if (userData.value) {
      authState.value = userData.value

      // Attempt silent login if suggested by the server and not already attempted
      // Also check if welcome modal is active to avoid interrupting the welcome flow
      if (userData.value.shouldAttemptSilentLogin && process.client && !silentLoginAttempted) {
        attemptSilentLogin()
      }
    }
  })

  // Watch for auth success parameter and refresh state
  if (process.client) {
    const route = useRoute()

    // Initial check for auth success
    if (route.query.auth === 'success') {
      nextTick(async () => {
        await refreshAuth()
      })
    }

    // Watch for route changes
    watch(
      () => route.query.auth,
      async (authParam) => {
        if (authParam === 'success') {
          await refreshAuth()
        }
      },
    )

    // Check for logout success parameter and refresh state
    if (route.query.auth === 'logout') {
      nextTick(async () => {
        await refreshAuth()
        authState.value = {
          isAuthenticated: false,
          user: null,
          token: null,
        }
        // Clean up the URL by removing the auth parameter
        await navigateTo('/', { replace: true })
      })
    }

    // Watch for logout success parameter
    watch(
      () => route.query.auth,
      async (authParam) => {
        if (authParam === 'logout') {
          await refreshAuth()
          authState.value = {
            isAuthenticated: false,
            user: null,
            token: null,
          }
          // Clean up the URL by removing the auth parameter
          await navigateTo('/', { replace: true })
        }
      },
    )
  }

  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const user = computed(() => authState.value.user)
  const token = computed(() => authState.value.token)
  const isLoading = ref(false)

  // Silent login attempt function
  const attemptSilentLogin = async () => {
    try {
      // Prevent multiple simultaneous silent login attempts
      if (isLoading.value) return

      // Prevent multiple silent login attempts - only allow once
      if (silentLoginAttempted) {
        return
      }
      silentLoginAttempted = true

      // Check cooldown period to prevent too frequent attempts
      const now = Date.now()
      if (now - lastSilentLoginAttempt < SILENT_LOGIN_COOLDOWN) {
        // Silent login skipped - cooldown period active
        return
      }
      lastSilentLoginAttempt = now

      // Attempting silent login...
      isLoading.value = true

      const currentPath = window.location.pathname + window.location.search + window.location.hash

      // Get the authorization URL for silent authentication
      const response = await $fetch<{
        success: boolean
        authorizationUrl?: string
        isSilent?: boolean
        reason?: string
        message?: string
      }>('/api/auth/silent-check', {
        method: 'GET',
        query: currentPath !== '/' ? { redirectTo: currentPath } : {},
        credentials: 'include',
      })

      if (response.success && response.authorizationUrl && response.isSilent) {
        // Redirect to Auth0 using the returned URL
        if (process.client) {
          window.location.href = response.authorizationUrl
        } else {
          await navigateTo(response.authorizationUrl, { external: true })
        }
      } else {
        // Silent authentication setup failed
        console.debug('Silent authentication not available:', response.reason, response.message)
      }
    } catch {
      // Silent failure - don't disrupt user experience
    } finally {
      isLoading.value = false
    }
  }

  const login = async (redirectTo?: string) => {
    isLoading.value = true
    try {
      let currentPath = redirectTo || '/'

      if (!redirectTo && process.client) {
        try {
          const route = useRoute()
          currentPath = route.fullPath || '/'
        } catch {
          currentPath = '/'
        }
      }

      // Call the login API endpoint to get the Auth0 authorization URL
      const response = await $fetch<{ success: boolean; authorizationUrl: string }>(
        '/api/auth/login',
        {
          method: 'GET',
          query: currentPath !== '/' ? { redirectTo: currentPath } : {},
          credentials: 'include',
        },
      )

      if (response.success && response.authorizationUrl) {
        // Redirect to Auth0 using the returned URL
        if (process.client) {
          window.location.href = response.authorizationUrl
        } else {
          await navigateTo(response.authorizationUrl, { external: true })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<{ success: boolean; logoutUrl: string }>('/api/auth/logout', {
        method: 'POST',
      })

      if (response.success) {
        // Clear local state
        authState.value = {
          isAuthenticated: false,
          user: null,
          token: null,
        }

        // Redirect to Auth0 logout or home
        if (process.client) {
          window.location.href = response.logoutUrl
        } else {
          await navigateTo(response.logoutUrl, { external: true })
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    logout,
    refreshAuth,
    attemptSilentLogin,
  }
}
