<template>
  <!-- Mobile menu button -->
  <lfx-menu-tablet  class="hidden sm:block lg:!hidden" />
  <lfx-menu-mobile  class="block sm:!hidden" />

  <!-- Menu -->
  <div class="items-center gap-4 hidden lg:flex">
    <div class="flex items-center gap-3 ">
      <lfx-menu-static-links />
    </div>
    <div class="border-r border-neutral-200 h-6" />
    <lfx-tools />
  </div>
</template>

<script setup lang="ts">
  import LfxTools from "~/components/shared/layout/tools.vue";
  import LfxMenuMobile from "~/components/shared/layout/menu/menu-mobile.vue";
  import LfxMenuTablet from "~/components/shared/layout/menu/menu-tablet.vue";
  import LfxMenuStaticLinks from "~/components/shared/layout/menu/static-links.vue";
</script>

<script lang="ts">
  export default {
    name: 'LfxMenu'
  }
</script>
