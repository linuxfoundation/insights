<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    (to) => {
      if (to.path.replace(/^\/organization\/?/i, '') === '') {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true }));
      }
      return navigateTo(to.fullPath.replace(/^\/organization/i, '/company'), { redirectCode: 301, replace: true });
    },
  ],
});
</script>
