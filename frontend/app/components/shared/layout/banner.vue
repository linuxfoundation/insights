<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="showBanner"
    class="sm:flex-row flex-col block bg-brand-800 text-white py-2 px-5 flex items-center sm:justify-center justify-start gap-3 relative"
  >
    <span class="sm:!text-xs text-2xs sm:leading-4 leading-3.5">
      Meet us in Amsterdam for KubeCon + CloudNativeCon Europe 2026 • Mar 23–26 •
    </span>
    <a
      href="https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/register/?utm_source=lfx-insights&utm_medium=homepage&utm_campaign=18269725-KubeCon-EU-2026&utm_content=banner"
      class="font-bold hover:underline no-underline whitespace-nowrap sm:!text-xs text-2xs sm:leading-4 leading-3.5"
      target="_blank"
      rel="noopener"
      >REGISTER NOW</a
    >

    <button
      class="text-white absolute top-1/2 -translate-y-1/2 right-2"
      @click="flagBanner"
    >
      <lfx-icon
        :size="14"
        name="close"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const showBanner = ref(false);

const flagBanner = () => {
  localStorage.setItem('lfx-kubecon2025-banner-flagged', 'true');
  showBanner.value = false;
};

onMounted(() => {
  const bannerFlagged = localStorage.getItem('lfx-kubecon2025-banner-flagged') === 'true';

  showBanner.value = new Date() < new Date('2026-03-23') && !bannerFlagged;
});
</script>

<script lang="ts">
export default {
  name: 'LfxBanner',
};
</script>
