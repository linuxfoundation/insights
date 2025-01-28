<template>
  <div class="container mx-auto">
    <h1 class="text-primary-500 mb-20">Sample Page</h1>
    <lfx-card class="p-5"> Sample Card </lfx-card>

    <div class="flex flex-row gap-2">
      <lfx-icon name="circle-info" type="solid" />
      <lfx-icon name="circle-info" type="light" :size="32" />
    </div>

    <div class="flex flex-row gap-2">
      <lfx-button @click="changeChartType('line')"> Line Chart </lfx-button>
      <lfx-button type="danger" @click="changeChartType('graph-only')"> Graph Only Chart </lfx-button>
      <lfx-button type="secondary" @click="changeChartType('bar')"> Bar Chart </lfx-button>
      <lfx-button type="secondary" @click="changeChartType('geo-map')"> Geo Map Chart </lfx-button>
      <lfx-button type="secondary" @click="changeChartType('scatter')"> Scatter Chart </lfx-button>
    </div>

    <lfx-line-chart-sample v-if="chartType === 'line'" :chart-data="chartData" />
    <lfx-bar-chart-sample v-if="chartType === 'bar'" :chart-data="chartData" />
    <lfx-line-chart-nogrid-sample v-if="chartType === 'graph-only'" :chart-data="chartData" />
    <lfx-geo-map-sample v-if="chartType === 'geo-map'" :chart-data="chartData" />
    <lfx-scatter-chart-sample v-if="chartType === 'scatter'" :chart-data="scatterChartData" />
    <lfx-button class="mt-5" @click="changeData"> Change Data </lfx-button>
  </div>
</template>

<script setup lang="ts">
import LfxCard from '@/components/uikit/card/Card.vue';
import LfxButton from '@/components/uikit/button/button.vue';
import LfxIcon from '@/components/uikit/icon/Icon.vue';
import { convertToChartData } from '@/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData } from '@/components/uikit/chart/types/ChartTypes';
import LfxLineChartSample from '@/components/samples/line-chart.sample.vue';
import LfxBarChartSample from '@/components/samples/bar-chart.sample.vue';
import LfxLineChartNogridSample from '@/components/samples/line-chart-nogrid.sample.vue';
import LfxGeoMapSample from '@/components/samples/geo-map.sample.vue';
import LfxScatterChartSample from '@/components/samples/scatter-chart.sample.vue';

const { data } = await useAsyncData('chart-data', () => $fetch('/api/issues-data'));
const { data: scatterCardData } = await useAsyncData('scatter-data', () => $fetch('/api/scatter-data'));

const chartType = ref<'line' | 'bar' | 'graph-only' | 'geo-map' | 'scatter'>('line');
const chartData = ref<ChartData[]>(
  convertToChartData(data.value, 'BUCKET_DT_FROM', ['CUMULATIVE_ISSUES', 'ISSUES_OPENED', 'ISSUES_CLOSED'])
);

const scatterChartData = ref<ChartData[]>(convertToChartData(scatterCardData.value, 'DAY', ['COMMITS'], 'HOUR'));

const changeChartType = (type: 'line' | 'bar' | 'graph-only' | 'geo-map' | 'scatter') => {
  chartType.value = type;
};
const changeData = () => {
  const tmp = data.value?.map((item: RawChartData) => ({
      BUCKET_DT_FROM: item.BUCKET_DT_FROM,
      BUCKET_DT_TO: item.BUCKET_DT_TO,
      IS_SUMMARY: item.IS_SUMMARY,
      CUMULATIVE_ISSUES: item.CUMULATIVE_ISSUES,
      ISSUES_OPENED: typeof item.ISSUES_OPENED === 'number' ? item.ISSUES_OPENED + 100 : 0,
      ISSUES_CLOSED: typeof item.ISSUES_CLOSED === 'number' ? item.ISSUES_CLOSED + 100 : 0
    })) ?? [];

  chartData.value = convertToChartData(tmp, 'BUCKET_DT_FROM', ['CUMULATIVE_ISSUES', 'ISSUES_OPENED', 'ISSUES_CLOSED']);
};

// console.log(convertToChartData(scatterCardData.value, 'DAY', ['COMMITS'], 'HOUR'));
</script>
