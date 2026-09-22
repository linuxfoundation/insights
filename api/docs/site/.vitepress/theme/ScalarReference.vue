<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<script setup lang="ts">
import '@scalar/api-reference/style.css';
import { onMounted, onUnmounted, ref } from 'vue';
import type { ApiReferenceInstance } from '@scalar/types/api-reference';

const mountEl = ref<HTMLDivElement | null>(null);
let instance: ApiReferenceInstance | null = null;
let unmounted = false;

onMounted(async () => {
  // Scalar mounts into the DOM directly, so it must load client-side, after mount.
  const { createApiReference } = await import('@scalar/api-reference');
  if (!mountEl.value) return;
  const created = createApiReference(mountEl.value, {
    url: '/v1/openapi.json',
    // Try-it client off: it would let a PAT be pasted into the browser.
    hideClientButton: true,
    hideTestRequestButton: true,
  });
  // Component may unmount while the dynamic import was pending; destroy right away instead of leaking.
  if (unmounted) {
    created.destroy();
    return;
  }
  instance = created;
});

onUnmounted(() => {
  unmounted = true;
  instance?.destroy();
  instance = null;
});
</script>

<template>
  <div ref="mountEl" />
</template>
