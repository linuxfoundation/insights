<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full md:w-3/4 lg:w-2/3 text-center flex items-center justify-center gap-2">
    <hr class="w-full border-t border-neutral-200" />
    <div class="flex items-center justify-center gap-2">
      <lfx-icon
        name="info-circle"
        :size="14"
        class="text-neutral-500"
      />
      <span class="text-neutral-500 text-xs text-nowrap">
        {{ allArchived ? 'All data shown is' : 'Includes data' }} from
        <span class="font-semibold">archived repositories</span>
      </span>
    </div>
    <hr class="w-full border-t border-neutral-200" />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  allArchived: boolean;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxReposInclusionNote',
};
</script>
