<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    style="width: 100%; height: 400px"
    class="flex justify-center items-center"
  >
    <div
      class="w-1/2"
      style="height: 400px"
    >
      <lfx-chart
        id="chartHalf"
        :config="getGaugeChartConfig(chartData)"
      />
    </div>
    <div
      class="w-1/2"
      style="height: 100px"
    >
      <lfx-chart
        id="chartFull"
        :config="getGaugeChartConfig(chartDataFull)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxChart from '~/components/uikit/chart/Chart.vue';
import type { GaugeData } from '~/components/uikit/chart/types/ChartTypes';
import { getGaugeChartConfig } from '~/components/uikit/chart/configs/gauge.chart';
import { lfxColors } from '~/config/styles/colors';

const chartData: GaugeData = {
  value: 10, // 0-100
  name: 'Excellent',
  gaugeType: 'half',
  color: lfxColors.positive[500]
};

const chartDataFull: GaugeData = {
  value: 99, // 0-100
  name: '',
  gaugeType: 'full',
  color: lfxColors.positive[500]
};
</script>

<script lang="ts">
export default {
  name: 'LfxGaugeChartSample'
};
</script>
