<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->

<template>
  <div class="min-h-screen flex items-center justify-center" />
</template>

<script setup lang="ts">

definePageMeta({
  layout: false,
  ssr: false // Disable SSR for this page (Auth0 callback needs client-side processing)
})

</script> 