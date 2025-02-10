<template>
  <div class="w-full">
    <div
      class="w-full lg:max-w-80 overflow-hidden bg-neutral-50 h-8 border
  border-neutral-200 rounded-full hidden sm:flex items-center gap-2 px-4">
      <lfx-icon name="search" class="text-neutral-400" :size="14" />
      <p class="text-body-1 text-neutral-400 truncate">
        Search projects, repositories...
      </p>
    </div>
    <div class="flex sm:!hidden justify-end">
      <lfx-menu-button class="!p-2">
        <lfx-icon name="search" class="font-black text-neutral-400 !h-5 !w-5" :size="18" />
      </lfx-menu-button>
    </div>
    <!-- TODO: implement search functionality -->
  </div>

</template>

<script setup lang="ts">

import LfxIcon from "~/components/uikit/icon/Icon.vue";
import LfxMenuButton from "~/components/uikit/menu-button/menu-button.vue";
</script>

<script lang="ts">
  export default {
    name: 'LfxSearch'
  }
</script>
