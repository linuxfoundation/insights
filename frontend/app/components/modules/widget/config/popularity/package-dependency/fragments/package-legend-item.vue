<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col sm:flex-row justify-between w-full sm:items-center">
    <div class="text-neutral-900 text-sm grow text-nowrap truncate">
      <span
        class="inline-block rounded-xs h-3 w-3 mr-3"
        :style="{ backgroundColor: props.color }"
      />{{ props.title }}
    </div>
    <div class="flex gap-3 w-1/2">
      <div class="text-xs flex flex-col sm:items-end min-w-15 sm:min-w-auto sm:w-1/3">
        <span class="text-neutral-400">Total</span>
        {{ delta.current > 9999 ? formatNumberShort(delta.current) : formatNumber(delta.current) }}
      </div>
      <lfx-delta-display
        :flip-display="true"
        :hide-previous-value="true"
        :summary="delta"
        :is-short="true"
        class="sm:items-end whitespace-nowrap sm:w-2/3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';

const props = defineProps<{
  title: string;
  delta: Summary;
  color: string;
}>();

</script>
<script lang="ts">
export default {
  name: 'LfxProjectPackageLegendItem',
}
</script>
