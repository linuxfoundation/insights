<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <header class="outline outline-1 outline-neutral-100 bg-white fixed top-0 left-0 z-40 w-full">
    <!-- Banner -->
    <lfx-banner />

    <div class="container">
      <div class="h-14 lg:h-17 flex justify-between items-center gap-4 lg:gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <div class="flex items-center gap-4">
            <!-- Mobile menu button -->
            <lfx-menu-tablet class="hidden sm:block lg:!hidden" />
            <lfx-menu-mobile class="block sm:!hidden" />

            <lfx-tools class="hidden lg:block" />
            <nuxt-link :to="{ name: LfxRoutes.EXPLORE }">
              <img
                src="~/assets/images/logo.svg"
                alt="LFX Insights"
                class="h-6 min-w-44 hidden xl:block"
                width="176"
                height="24"
              />
              <img
                src="~/assets/images/logo-mobile.svg"
                alt="LFX Insights"
                class="h-6 min-w-29 block xl:hidden"
                width="116"
                height="24"
              />
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
import LfxSearch from '~/components/shared/layout/search/search.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxMenu from '~/components/shared/layout/menu.vue';
import LfxTools from '~/components/shared/layout/tools.vue';
import LfxMenuMobile from '~/components/shared/layout/menu/menu-mobile.vue';
import LfxMenuTablet from '~/components/shared/layout/menu/menu-tablet.vue';
import LfxBanner from '~/components/shared/layout/banner.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxNavbar',
};
</script>
