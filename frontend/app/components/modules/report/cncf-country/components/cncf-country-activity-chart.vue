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
  <ul
    class="sr-only"
    :aria-label="`${label} per period`"
  >
    <li
      v-for="period in periods"
      :key="period.key"
    >
      {{ period.label }}: {{ period.value }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { computed } from 'vue';

import { formatNumber, formatNumberShort } from '~/components/shared/utils/formatter';
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

const periods = computed(() =>
  props.data.map((point) => ({
    key: point.startDate,
    label: DateTime.fromISO(point.startDate).toFormat(props.granularity === 'yearly' ? 'yyyy' : 'MMM yyyy'),
    value: formatNumber(point[props.metric]),
  })),
);

const chartConfig = computed(() => {
  const config = getLineAreaChartConfig(chartData.value, chartSeries.value, props.granularity, (value: number) =>
    formatNumberShort(value),
  );

  // The default y-axis bounds divide by the data range, which is NaN for a flat series.
  const values = props.data.map((point) => point[props.metric]);
  const max = Math.max(...values);
  if (values.length && max === Math.min(...values)) {
    config.yAxis = { ...config.yAxis, min: 0, max: Math.max(1, max * 2) };
  }

  return config;
});
</script>

<script lang="ts">
export default {
  name: 'LfxCncfCountryActivityChart',
};
</script>
