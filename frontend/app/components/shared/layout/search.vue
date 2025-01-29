<template>
  <div
    class="w-full max-w-80 overflow-hidden bg-neutral-50 h-8 border
  border-neutral-200 rounded-full flex items-center gap-2 px-4">
    <lfx-icon name="search" class="text-neutral-400" :size="14" />
    <p class="text-body-1 text-neutral-400 truncate">
      Search projects, repositories...
    </p>
  </div>
  <!-- TODO: implement search functionality -->
</template>

<script setup lang="ts">

import LfxIcon from "~/components/uikit/icon/Icon.vue";
</script>

<script lang="ts">
  export default {
    name: 'LfxSearch'
  }
</script>
