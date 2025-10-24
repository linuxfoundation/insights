<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="lfx-table">
    <div class="lfx-table-header">
      <div class="flex flex-row gap-3 items-center grow">
        <div class="mr-1">#</div>
        {{ props.type.charAt(0).toUpperCase() + props.type.slice(1) }}
      </div>
      <div
        v-if="props.type === 'project'"
        class="text-right"
      >
        Contributor Count
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  type: 'project' | 'contributor' | 'organization';
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxExploreTableHeader',
};
</script>
