<template>
  <VChart :option="props.config" />
</template>

<script setup lang="ts">
import { registerMap } from 'echarts';
import world from '~/components/config/world.json';
import type { SeriesTypes } from '@/components/uikit/chart/types/ChartTypes';

const props = defineProps<{
  config: ECOption;
}>();

onBeforeMount(() => {
  const series = props.config.series as SeriesTypes[];
  series?.forEach((seriesItem: SeriesTypes) => {
    if (seriesItem.type === 'map') {
      // this is still an unresolved issue with echarts: https://github.com/apache/echarts/issues/15527
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registerMap('world', world as any);
    }
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxChart'
};
</script>
