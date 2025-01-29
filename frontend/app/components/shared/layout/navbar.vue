<template>
  <header class="border-b border-neutral-100 bg-white sticky top-0 left-0 ">
    <div class="container">
      <div class="h-18 flex justify-between items-center gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <div>
            <nuxt-link :to="{ name: LfxRoutes.EXPLORE }">
              <img src="~/assets/images/logo.svg" alt="LFX Insights" class="h-6 min-w-44">
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
import LfxSearch from "~/components/shared/layout/search.vue";
import {LfxRoutes} from "~/components/shared/types/routes";
import LfxMenu from "~/components/shared/layout/menu.vue";
</script>

<script lang="ts">
  export default {
    name: 'LfxNavbar'
  }
</script>
