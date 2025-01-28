<template>
  <div style="width: 100%; height: 500px">
    <lfx-chart :config="getGeoMapChartConfig(chartData, chartSeries)" />
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { getGeoMapChartConfig } from '~/components/uikit/chart/configs/geo-map.chart';

const chartData = ref<ChartData[]>([
  { key: 'United States of America', values: [48202] },
  { key: 'China', values: [4823] },
  { key: 'Canada', values: [22023] },
  { key: 'Australia', values: [2023] }
]);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'World Population',
    type: 'map',
    yAxisIndex: 0,
    dataIndex: 0
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxGeoMapSample'
};
</script>
