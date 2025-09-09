<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      <p class="mt-4 text-gray-600">Processing authentication...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page handles the Auth0 callback when callback path is set to '/auth/callback'
// It redirects to the API endpoint that handles the actual token exchange

const route = useRoute()

try {
  // Redirect to the API callback endpoint with all query parameters
  const queryParams = new URLSearchParams()
  Object.entries(route.query).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, Array.isArray(value) ? value[0] : value)
    }
  })

  await navigateTo(`/api/auth/callback?${queryParams.toString()}`, { external: true })
} catch (error) {
  console.error('Callback page error:', error)
  // Fallback redirect to home with error
  await navigateTo('/?auth_error=callback_failed')
}
</script>
