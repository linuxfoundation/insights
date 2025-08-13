<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="min-h-screen flex items-center justify-center" />
</template>

<script setup lang="ts">

// This page handles the Auth0 callback
// Process the authorization code and redirect the user

// Set page metadata
// Note: definePageMeta is auto-imported in Nuxt 3
// @ts-ignore
definePageMeta({
  layout: false,
  ssr: false // Disable SSR for this page (Auth0 callback needs client-side processing)
})

// const { handleRedirectCallback, isAuthenticated, error } = useAuth0()
// const errorMessage = ref<string | null>(null)
// const isProcessing = ref(true)

// // Handle the callback on client-side
// onMounted(async () => {
  
// })
</script> 