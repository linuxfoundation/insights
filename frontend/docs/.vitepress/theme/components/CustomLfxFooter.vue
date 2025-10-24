<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="custom-footer-container mx-auto"
    :class="{ 'has-sidebar': hasSidebar }"
  >
    <div
      class="px-5 md:px-10"
      :class="{
        'max-w-7xl mx-auto': !hasSidebar,
      }"
    >
      <client-only>
        <lfx-footer
          cookie-tracking
          class="pt-10 md:pt-16 pb-5 md:pb-8 px-0"
        />
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress';
import { onMounted, ref, nextTick, watch, computed } from 'vue';

const { page } = useData();

const pagePath = computed(() => page.value.filePath);

const hasSidebar = ref(false);

// Only import the UI core library on the client side
onMounted(async () => {
  await import('@linuxfoundation/lfx-ui-core');

  // Wait for DOM updates if needed
  await nextTick();

  const sidebarEl = document.querySelector('.VPSidebar') as HTMLElement | null;

  hasSidebar.value = !!(sidebarEl && sidebarEl.offsetWidth > 0);
});

watch(pagePath, () => {
  const sidebarEl = document.querySelector('.VPSidebar') as HTMLElement | null;

  hasSidebar.value = !!(sidebarEl && sidebarEl.offsetWidth > 0);
});
</script>

<style lang="scss" scoped>
.copyright {
  color: #808b91;
  a {
    color: #5b6367;

    &:hover {
      @apply underline;
    }
  }
}

@media (min-width: 960px) {
  .has-sidebar.custom-footer-container {
    margin: var(--vp-layout-top-height, 0px) 0 0;
    padding-left: var(--vp-sidebar-width);
  }
}

@media (min-width: 1440px) {
  .has-sidebar.custom-footer-container {
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2);
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}
</style>
