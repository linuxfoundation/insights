<template>
  <!-- Mobile menu button -->
  <div class="block lg:!hidden">
    <lfx-menu-button class="!px-2">
      <lfx-icon name="bars" class="font-black" />
    </lfx-menu-button>
  </div>

  <!-- Menu -->
  <div class="items-center gap-4 hidden lg:flex">
    <div class="flex items-center gap-3 ">
      <lfx-menu-button :to="{name: LfxRoutes.EXPLORE}">
        <lfx-icon name="compass" />
        Explore
      </lfx-menu-button>
      <lfx-menu-button :to="{name: LfxRoutes.CHARTS}">
        <lfx-icon name="rectangle-history" />
        Collections
      </lfx-menu-button>
      <lfx-menu-button :to="{name: LfxRoutes.CHARTS}">
        <lfx-icon name="globe" />
        Open Source Index
      </lfx-menu-button>
    </div>
    <div class="border-r border-neutral-200 h-6" />

    <lfx-menu-button class="!px-2">
      <lfx-icon name="grid-round" class="font-black" />
    </lfx-menu-button>
  </div>
</template>

<script setup lang="ts">
  import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
  import LfxIcon from "~/components/uikit/icon/Icon.vue";
  import {LfxRoutes} from "~/components/shared/types/routes";
</script>

<script lang="ts">
  export default {
    name: 'LfxMenu'
  }
</script>
