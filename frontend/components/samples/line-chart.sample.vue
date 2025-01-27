<template>
  <lfx-chart :config="getLineAreaChartConfig(props.chartData, chartSeries)" />
</template>

<script setup lang="ts">
import LfxChart from '@/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries } from '@/components/uikit/chart/types/ChartTypes';
import { getLineAreaChartConfig } from '@/components/uikit/chart/configs/line.area.chart';
import colors from '@/assets/constants/colors.json';

const props = defineProps<{
  chartData: ChartData[];
}>();

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Issues Opened',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: colors.positive[500],
    lineStyle: 'dashed'
  },
  {
    name: 'Issues Closed',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: colors.brand[500]
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxLineChartSample'
};
</script>
