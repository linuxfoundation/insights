<!-- .vitepress/theme/components/CustomNavbar.vue -->
<template>
  <header class="outline outline-1 outline-neutral-100 bg-white sticky top-0 left-0 z-40">
    <div class="max-w-7xl mx-auto px-5 md:px-10">
      <div class="h-14 lg:h-17 flex justify-between items-center gap-4 lg:gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <div>
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
          </div>
          <VPNavBarSearch />
        </div>

        <a
          href="http://localhost:3000"
          class="text-sm font-medium text-neutral-500 hover:text-neutral-600"
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
