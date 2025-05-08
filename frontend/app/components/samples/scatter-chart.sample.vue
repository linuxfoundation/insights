<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div style="width: 100%; height: 500px">
    <lfx-chart :config="getScatterChartConfig(props.chartData, chartSeries)" />
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { getScatterChartConfig } from '~/components/uikit/chart/configs/scatter.chart';
import { lfxColors } from "~/config/styles/colors";

const props = defineProps<{
  chartData: ChartData[];
}>();

// const categoryData: CategoryData = {
//   xAxis: [
//     { key: 'Mon', value: 1 },
//     { key: 'Tue', value: 2 },
//     { key: 'Wed', value: 3 },
//     { key: 'Thu', value: 4 },
//     { key: 'Fri', value: 5 },
//     { key: 'Sat', value: 6 },
//     { key: 'Sun', value: 0 }
//   ],
//   yAxis: [
//     { key: '8:00', value: 8 },
//     { key: '10:00', value: 10 },
//     { key: '12:00', value: 12 },
//     { key: '14:00', value: 14 },
//     { key: '16:00', value: 16 },
//     { key: '18:00', value: 18 },
//     { key: '20:00', value: 20 },
//     { key: '22:00', value: 22 },
//     { key: '0:00+1', value: 0 },
//     { key: '2:00+1', value: 2 },
//     { key: '4:00+1', value: 4 },
//     { key: '6:00+1', value: 6 },

//   ]
// };

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Commits',
    type: 'scatter',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxScatterChartSample'
};
</script>
