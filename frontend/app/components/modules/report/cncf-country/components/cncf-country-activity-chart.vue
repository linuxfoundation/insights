<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="h-[280px] sm:h-[360px]">
    <client-only>
      <lfx-chart
        :config="chartConfig"
        :animation="true"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatNumberShort } from '~/components/shared/utils/formatter';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import type { ChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import type { CncfCountryActivityMetric, CncfCountryTimeseriesPoint } from '~~/types/report/cncf-country.types';

const props = defineProps<{
  data: CncfCountryTimeseriesPoint[];
  metric: CncfCountryActivityMetric;
  label: string;
  granularity: string;
}>();

const chartData = computed<ChartData[]>(() =>
  props.data.map((point) => ({ key: point.startDate, values: [point[props.metric]] })),
);

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: props.label,
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    color: lfxColors.brand[500],
  },
]);

const chartConfig = computed(() =>
  getLineAreaChartConfig(chartData.value, chartSeries.value, props.granularity, (value: number) =>
    formatNumberShort(value),
  ),
);
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountryActivityChart',
};
</script>
