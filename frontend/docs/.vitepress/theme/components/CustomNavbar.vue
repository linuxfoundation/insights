<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- .vitepress/theme/components/CustomNavbar.vue -->
<template>
  <header class="outline outline-1 outline-neutral-100 bg-white sticky top-0 left-0 z-40 wrapper">
    <div class="mx-auto wrapper-content">
      <div class="h-14 lg:h-17 flex justify-between items-center gap-4 lg:gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <a
            href="/docs/introduction/what-is-insights/"
            target="_parent"
          >
            <img
              src="/images/logo.svg"
              alt="LFX Insights"
              class="h-6 min-w-44 hidden xl:block"
            >
            <img
              src="/images/logo-mobile.svg"
              alt="LFX Insights"
              class="h-6 min-w-29 block xl:hidden"
            >
          </a>
          <VPNavBarSearch />
        </div>
        <a
          href="/"
          target="_parent"
          class="c-menu-button"
        >
          Back to LFX Insights
        </a>
        <VPSocialLinks />
      </div>
    </div>
  </header>
</template>

<script setup>
import { VPNavBarSearch, VPSocialLinks } from 'vitepress/theme'
</script>

<style lang="scss" scoped>
@media (min-width: 768px) {
    .wrapper {
      @apply px-8;
    }
}

.wrapper-content {
  max-width: calc(var(--vp-layout-max-width) - 64px);
}
</style>
