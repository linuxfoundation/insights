<template>
  <div class="flex flex-row justify-between w-full items-center">
    <span class="text-neutral-900 text-sm grow">
      <span
        class="inline-block rounded-xs h-3 w-3 mr-3"
        :style="{ backgroundColor: props.color }"
      />{{ props.title }}
    </span>
    <div class="text-xs flex flex-col basis-1/5 items-end">
      <span class="text-neutral-400">Total</span>
      {{ formatNumber(delta.current) }}
    </div>
    <lfx-delta-display
      :flip-display="true"
      :hide-previous-value="true"
      :summary="delta"
      icon="circle-arrow-up-right"
      icon-type="solid"
      class="items-end basis-2/5"
    />
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from '~/components/shared/utils/formatter';
import type { Summary } from '~/components/shared/types/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';

const props = defineProps<{
  title: string;
  delta: Summary;
  color: string;
}>();

</script>
<script lang="ts">
export default {
  name: 'LfxProjectPullRequestLegendItem',
}
</script>
