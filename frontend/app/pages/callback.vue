<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="min-h-screen flex items-center justify-center" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from "vue-router"
import { LfxRoutes } from '~/components/shared/types/routes'


definePageMeta({
  layout: false,
  ssr: false // Disable SSR for this page (Auth0 callback needs client-side processing)
})

// const { isAuthenticated, error } = useAuth0()
const router = useRouter()

// Handle the callback on client-side
onMounted(async () => {
  // Wait a bit for Auth0 to initialize
  await new Promise(resolve => setTimeout(resolve, 100))
  
  try {
    const redirectTo = localStorage.getItem('lfx-login-redirect');

    if (redirectTo) {
      // window.location.href = redirectTo;
    } else {
      router.push(LfxRoutes.HOME);
    }
  } catch {
    // Redirect to home page on error
    router.push(LfxRoutes.HOME)
  }
})
</script> 