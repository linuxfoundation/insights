<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        Completing authentication...
      </h2>
      <p class="text-gray-600">
        Please wait while we redirect you back to the application.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page handles the Auth0 callback
// The Auth0 plugin will automatically handle the callback process
// and redirect the user back to the application

// Set page metadata
definePageMeta({
  layout: false
})

// Handle the callback on client-side
onMounted(async () => {
  // The Auth0 plugin handles the callback automatically
  // After successful authentication, redirect to home
  await nextTick()
  
  // Small delay to ensure Auth0 processing is complete
  setTimeout(() => {
    navigateTo('/')
  }, 1000)
})
</script> 