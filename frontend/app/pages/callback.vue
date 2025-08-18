<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="min-h-screen flex items-center justify-center" />
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import { onMounted } from 'vue'
import { useRouter } from "vue-router";


// Set page metadata
// Note: definePageMeta is auto-imported in Nuxt 3
definePageMeta({
  layout: false,
  ssr: false // Disable SSR for this page (Auth0 callback needs client-side processing)
})

const { isAuthenticated, user } = useAuth0()
const router = useRouter()

// // Handle the callback on client-side
onMounted(async () => {
  if (isAuthenticated.value) {
    const appState = user.value?.app_metadata?.appState; // Access appState from user metadata
    if (appState && appState.redirectTo) {
        router.push(appState.redirectTo); // Or use window.location.href for full page reload
    } else {
        router.push("/"); // Default redirect if no target is found
    }
  }
})
</script> 