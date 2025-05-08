<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <header class="outline outline-1 outline-neutral-100 bg-white sticky top-0 left-0 z-40">
    <div class="container">
      <div class="h-14 lg:h-17 flex justify-between items-center gap-4 lg:gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <div>
            <nuxt-link :to="{ name: LfxRoutes.COLLECTIONS }">
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
</script>

<script lang="ts">
  export default {
    name: 'LfxNavbar'
  }
</script>
