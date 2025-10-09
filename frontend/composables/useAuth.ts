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

      // Attempt silent login if suggested by the server
      if (userData.value.shouldAttemptSilentLogin && process.client) {
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

      // Check cooldown period to prevent too frequent attempts
      const now = Date.now()
      if (now - lastSilentLoginAttempt < SILENT_LOGIN_COOLDOWN) {
        // Silent login skipped - cooldown period active
        return
      }
      lastSilentLoginAttempt = now

      // Attempting silent login...
      isLoading.value = true

      // Call the silent login API
      const response = await $fetch<{
        success: boolean
        authorizationUrl?: string
        isSilent?: boolean
        reason?: string
      }>('/api/auth/silent-login', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.success && response.authorizationUrl && response.isSilent) {
        // Create a hidden iframe to attempt silent authentication
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = response.authorizationUrl

        // Set up a timeout to clean up the iframe
        const timeoutId = setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe)
          }
          isLoading.value = false
          // Silent login timeout - user may not be logged in to SSO
        }, 10000) // 10 second timeout

        // Listen for the iframe to load (which might indicate success or failure)
        iframe.onload = () => {
          clearTimeout(timeoutId)
          // Check if we're now on the callback URL (success) or error page
          try {
            const iframeUrl = iframe.contentWindow?.location.href
            if (
              iframeUrl &&
              (iframeUrl.includes('/api/auth/callback') || iframeUrl.includes('auth=success'))
            ) {
              // Success! The iframe was redirected to callback or success page
              setTimeout(() => {
                isLoading.value = false
                refreshAuth()
                if (iframe.parentNode) {
                  iframe.parentNode.removeChild(iframe)
                }
              }, 1000) // Give callback time to process
            } else {
              // Clean up iframe after a short delay
              setTimeout(() => {
                isLoading.value = false
                if (iframe.parentNode) {
                  iframe.parentNode.removeChild(iframe)
                }
              }, 2000)
            }
          } catch (e) {
            // Cross-origin error is expected, clean up iframe
            setTimeout(() => {
              isLoading.value = false
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe)
              }
            }, 2000)
          }
        }

        // Add iframe to document
        document.body.appendChild(iframe)
      } else {
        console.log('Silent login not attempted:', response.reason || 'Unknown reason')
      }
    } catch (error) {
      console.log('Silent login failed:', error)
      // Silent failure - don't disrupt user experience
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
