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
        {{ formatNumber(item.count) }} {{ pluralize(props.label.toLowerCase(), item.count) }} ・
        {{ formatNumber(item.percentage, item.percentage < 1 ? 2 : 0) }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import pluralize from 'pluralize';
import { filterKnownCountries } from '../geo-map.helper';
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

const knownGeoMapData = computed(() => filterKnownCountries(props.geoMapData));

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
