<template>
  <div class="mb-4">
    <label class="flex items-center">
      <input
        v-model="isStacked"
        type="checkbox"
        class="mr-2"
      >
      <span>Show Stacked Bar</span>
    </label>
  </div>
  <div style="width: 100%; height: 500px">
    <lfx-chart :config="barChartConfig" />
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { getBarChartConfig, getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import {lfxColors} from "~/config/styles/colors";

const props = defineProps<{
  chartData: ChartData[];
}>();

const isStacked = ref(false);
const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Issues Opened',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.positive[500]
  },
  {
    name: 'Issues Closed',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const barChartConfig = computed(() => (isStacked.value
    ? getBarChartConfigStacked(props.chartData, chartSeries.value)
    : getBarChartConfig(props.chartData, chartSeries.value)));
</script>

<script lang="ts">
export default {
  name: 'LfxBarChartSample'
};
</script>
