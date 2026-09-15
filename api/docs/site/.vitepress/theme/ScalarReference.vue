<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- Copyright (c) 2025 The Linux Foundation and each contributor. -->
<!-- SPDX-License-Identifier: MIT -->
<script setup lang="ts">
import '@scalar/api-reference/style.css';
import { onMounted, ref } from 'vue';

const mountEl = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  // Scalar mounts into the DOM directly, so it must load client-side, after mount.
  const { createApiReference } = await import('@scalar/api-reference');
  if (!mountEl.value) return;
  createApiReference(mountEl.value, {
    url: '/v1/openapi.json',
    // Try-it client off: it would let a PAT be pasted into the browser.
    hideClientButton: true,
    hideTestRequestButton: true,
  });
});
</script>

<template>
  <div ref="mountEl" />
</template>
