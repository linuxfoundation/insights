<template>
  <div style="width: 100%; height: 400px">
    <lfx-chart :config="getGaugeChartConfig(chartData)" />
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { GaugeData } from '~/components/uikit/chart/types/ChartTypes';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/components/config/styles/colors';

const chartData: GaugeData = {
  value: 100, // 0-100
  name: 'Excellent',
  gaugeType: 'half',
  color: lfxColors.positive[500]
};
</script>

<script lang="ts">
export default {
  name: 'LfxGaugeChartSample'
};
</script>
