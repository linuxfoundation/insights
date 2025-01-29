<template>
  <VChart :option="props.config" />
</template>

<script setup lang="ts">
import { registerMap } from 'echarts';
import world from './configs/world.json';
import type { SeriesTypes } from '~/components/uikit/chart/types/ChartTypes';
// import * as echarts from 'echarts';

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

// onMounted(() => {
//   const chart = echarts.getInstanceByDom(document.getElementById('chart'));
//   console.log(chart?.ren);
// });
</script>

<script lang="ts">
export default {
  name: 'LfxChart'
};
</script>
