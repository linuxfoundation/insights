<template>
  <div style="width: 100%; height: 180px">
    <lfx-chart :config="getHeatMapChartConfig(props.chartData, chartSeries, categoryData)" />
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries, CategoryData } from '~/components/uikit/chart/types/ChartTypes';
import { getHeatMapChartConfig } from '~/components/uikit/chart/configs/heat-map.chart';
import { lfxColors } from '~/components/config/styles/colors';

const props = defineProps<{
  chartData: ChartData[];
}>();

const categoryData: CategoryData = {
  xAxis: [
    { key: 1, value: 1 },
    { key: 2, value: 2 },
    { key: 3, value: 3 },
    { key: 4, value: 4 },
    { key: 5, value: 5 },
    { key: 6, value: 6 },
    { key: 7, value: 7 },
    { key: 8, value: 8 },
    { key: 9, value: 9 },
    { key: 10, value: 10 },
    { key: 11, value: 11 },
    { key: 12, value: 12 },
    { key: 13, value: 13 },
    { key: 14, value: 14 },
    { key: 15, value: 15 },
    { key: 16, value: 16 },
    { key: 17, value: 17 },
    { key: 18, value: 18 },
    { key: 19, value: 19 },
    { key: 20, value: 20 },
    { key: 21, value: 21 },
    { key: 22, value: 22 },
    { key: 23, value: 23 },
    { key: 24, value: 24 },
    { key: 25, value: 25 },
    { key: 26, value: 26 },
    { key: 27, value: 27 },
    { key: 28, value: 28 },
    { key: 29, value: 29 },
    { key: 30, value: 30 }
  ],
  yAxis: [{ key: 0, value: 0 }]
};

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Commits',
    type: 'heatmap',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxHeatMapChartSample'
};
</script>
