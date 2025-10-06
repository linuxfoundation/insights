<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <header class="outline outline-1 outline-neutral-100 bg-white fixed top-0 left-0 z-40 w-full">

    <!-- Banner -->
    <div 
      class="block bg-brand-800 text-white py-2 px-5 flex 
      items-center sm:justify-center justify-start gap-3"
    >
      <span class="text-2xs sm:text-xs leading-3.5 sm:leading-4">
        Meet us in Atlanta for KubeCon + CloudNativeCon North America · Nov 10-13
      </span>
      <a
        href="https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/register/?utm_source=lfx-insights&utm_medium=homepage&utm_campaign=KubeCon-NA-2025&utm_content=hero"
        class="font-bold no-underline whitespace-nowrap text-2xs sm:text-xs leading-3.5 sm:leading-4"
        target="_blank"
        rel="noopener"
      >REGISTER TODAY</a>
    </div>
    <!-- <lfx-banner /> -->

    <div class="container">
      <div class="h-14 lg:h-17 flex justify-between items-center gap-4 lg:gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <div>
            <nuxt-link :to="{ name: LfxRoutes.EXPLORE }">
              <img
                src="~/assets/images/logo.svg"
                alt="LFX Insights"
                class="h-6 min-w-44 hidden xl:block"
              >
              <img
                src="~/assets/images/logo-mobile.svg"
                alt="LFX Insights"
                class="h-6 min-w-29 block xl:hidden"
              >
            </nuxt-link>
          </div>
          <lfx-search />
        </div>

        <lfx-menu />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import LfxSearch from "~/components/shared/layout/search/search.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxMenu from "~/components/shared/layout/menu.vue";
import LfxBanner from "~/components/shared/layout/banner.vue";
</script>

<script lang="ts">
  export default {
    name: 'LfxNavbar'
  }
</script>
