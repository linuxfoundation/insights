<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full h-[330px]">
    <client-only>
      <lfx-chart
        :config="getGeoMapChartConfig(chartData, chartSeries, getMaxValue(chartData))"
        :animation="props.animation"
      />
    </client-only>
  </div>
  <div class="flex flex-col gap-5">
    <div
      v-for="item in listData"
      :key="item.name"
      class="flex flex-row justify-between items-center text-sm"
    >
      <div class="flex flex-row gap-4 items-center">
        <span class="text-base">
          {{ item.flag }}
        </span>
        <span class="font-medium">
          {{ item.name }}
        </span>
      </div>
      <span>
        {{ formatNumber(item.count) }} {{ pluralize(props.label.toLowerCase(), item.count) }} ・ {{ item.percentage }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import pluralize from 'pluralize';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { convertToChartData, getMaxValue } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import { getGeoMapChartConfig } from '~/components/uikit/chart/configs/geo-map.chart';
import { formatNumber } from '~/components/shared/utils/formatter';
import type { GeoMapData } from '~/components/modules/widget/components/contributors/types/geo-map.types';

const props = withDefaults(
  defineProps<{
    geoMapData?: GeoMapData[];
    label: string;
    limit?: number;
    animation?: boolean;
  }>(),
  {
    geoMapData: () => [],
    limit: undefined,
    animation: true,
  },
);

// "Unknown" location is intentionally hidden from the list and chart (see IN-1225 / #2062).
const knownGeoMapData = computed(() => props.geoMapData.filter((item) => item.name !== 'Unknown'));

const listData = computed(() => (props.limit ? knownGeoMapData.value.slice(0, props.limit) : knownGeoMapData.value));

const chartData = computed<ChartData[]>(() =>
  convertToChartData(knownGeoMapData.value as unknown as RawChartData[], 'name', ['count', 'percentage']).map(
    (item) => ({
      ...item,
      key: item.key === 'United States' ? 'United States of America' : item.key,
    }),
  ),
);

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: props.label,
    type: 'map',
    yAxisIndex: 0,
    dataIndex: 0,
  },
]);
</script>

<script lang="ts">
export default {
  name: 'LfxGeoDistributionView',
};
</script>
