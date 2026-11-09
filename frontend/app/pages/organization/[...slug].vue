<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div />
</template>

<script setup lang="ts">
const route = useRoute();
const slug = ([] as string[]).concat(route.params.slug || []).join('/');

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

await navigateTo(
  { path: `/company/${slug}`, query: route.query, hash: route.hash },
  { redirectCode: 301, replace: true },
);
</script>
