<template>
  <lfx-chart :config="getLineAreaChartConfigGraphOnly(props.chartData, chartSeries)" />
</template>

<script setup lang="ts">
import LfxChart from '@/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries } from '@/components/uikit/chart/types/ChartTypes';
import { getLineAreaChartConfigGraphOnly } from '@/components/uikit/chart/configs/line.area.chart';
import {lfxColors} from "~/components/config/colors";

const props = defineProps<{
  chartData: ChartData[];
}>();

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Cumulative Issues',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxLineChartNogridSample'
};
</script>
