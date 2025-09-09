<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      <p class="mt-4 text-gray-600">Redirecting to login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page handles login redirect to avoid routing conflicts
const route = useRoute()

// Redirect to the API login endpoint with query parameters
const queryParams = new URLSearchParams()
Object.entries(route.query).forEach(([key, value]) => {
  if (value) {
    queryParams.append(key, Array.isArray(value) ? value[0] : value)
  }
})

if (process.client) {
  // Use window.location.replace to avoid back button issues
  window.location.replace(`/api/auth/login?${queryParams.toString()}`)
} else {
  // Server-side redirect
  await navigateTo(`/api/auth/login?${queryParams.toString()}`, { external: true })
}
</script>
