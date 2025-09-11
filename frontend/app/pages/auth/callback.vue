<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div
        v-if="!error"
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
      />
      <div
        v-else
        class="text-red-600"
      >
        <p class="mb-2">Authentication failed</p>
        <p class="text-sm">{{ error }}</p>
        <NuxtLink
          to="/"
          class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return Home
        </NuxtLink>
      </div>
      <p class="mt-4 text-gray-600">{{ error ? '' : 'Processing authentication...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page handles the Auth0 callback when callback path is set to '/auth/callback'
// It redirects to the API route which will handle the callback and redirect appropriately

const route = useRoute()

// Build the API callback URL with all query parameters
const queryParams = new URLSearchParams()
Object.entries(route.query).forEach(([key, value]) => {
  if (value) {
    queryParams.append(key, Array.isArray(value) ? value[0] : value)
  }
})

const callbackApiUrl = `/api/auth/callback?${queryParams.toString()}`

// Redirect to the API route which will handle the callback and redirect
await navigateTo(callbackApiUrl, { external: true })
</script>
