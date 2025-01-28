<template>
  <div style="width: 100%; height: 500px">
    <lfx-chart :config="getLineAreaChartConfig(props.chartData, chartSeries)" />
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import {lfxColors} from "~/components/config/styles/colors";

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
    color: lfxColors.positive[500],
    lineStyle: 'dashed'
  },
  {
    name: 'Issues Closed',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxLineChartSample'
};
</script>
