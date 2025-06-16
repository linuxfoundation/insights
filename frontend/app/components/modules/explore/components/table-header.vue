<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="lfx-table"
  >
    <div
      class="lfx-table-header"
    >
      <div class="flex flex-row gap-3 items-center grow">
        <div class="mr-1">
          #
        </div>
        {{ props.type.charAt(0).toUpperCase() + props.type.slice(1) }}
      </div>
      <div
        v-if="props.type !== 'project'"
        class="basis-1/3 text-right"
      >Total contributions (10Y)</div>
      <div
        v-if="props.type === 'project'"
        class="basis-1/5 text-right"
      >Contributors</div>
      <div
        v-if="props.type === 'project'"
        class="basis-1/5 text-right"
      >Software value</div>
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
  name: 'LfxExploreTableHeader'
};
</script>
