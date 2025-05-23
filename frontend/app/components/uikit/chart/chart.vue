<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full h-full flex flex-col justify-between">
    <VChart
      id="chart"
      :option="{
        ...props.config,
        animation: props.animation,
      }"
      autoresize
    />
    <div>
      <slot name="legend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { registerMap } from 'echarts';
// import * as echarts from 'echarts';
import world from './configs/world.json';
import type { SeriesTypes } from '~/components/uikit/chart/types/ChartTypes';

const props = withDefaults(defineProps<{
  config: ECOption;
  animation?: boolean;
}>(), {
  animation: true,
});

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
//   const chart = echarts.getInstanceByDom(document.getElementById('chart') as HTMLElement);

//   chart?.on('click', (params: any) => {
//     console.log(params);
//   });
// });
</script>

<script lang="ts">
export default {
  name: 'LfxChart'
};
</script>
