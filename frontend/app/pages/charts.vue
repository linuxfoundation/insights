<template>
  <div class="container">
    <h1 class="text-primary-500 mb-20">Charts test page</h1>
    <div class="p-4 bg-white">
      <lfx-tabs v-model="chartType" :tabs="chartTypes">
        <!-- <template #slotItem="{ option }">
          <span class="text-neutral-500">{{ option.label }}123</span>
        </template> -->
      </lfx-tabs>
    </div>

    <lfx-line-chart-sample v-if="chartType === 'line'" :chart-data="chartData" />
    <lfx-bar-chart-sample v-if="chartType === 'bar'" :chart-data="chartData" />
    <lfx-line-chart-nogrid-sample v-if="chartType === 'graph-only'" :chart-data="chartData" />
    <lfx-geo-map-sample v-if="chartType === 'geo-map'" :chart-data="chartData" />
    <lfx-scatter-chart-sample v-if="chartType === 'scatter'" :chart-data="scatterChartData" />
    <lfx-heat-map-chart-sample v-if="chartType === 'heatmap'" :chart-data="heatMapChartData" />
    <lfx-gauge-chart-sample v-if="chartType === 'gauge'" />
    <lfx-button class="mt-5" @click="changeData"> Change Data </lfx-button>
  </div>
</template>

<script setup lang="ts">
import LfxButton from '~/components/uikit/button/button.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData } from '~/components/uikit/chart/types/ChartTypes';
import LfxLineChartSample from '~/components/samples/line-chart.sample.vue';
import LfxBarChartSample from '~/components/samples/bar-chart.sample.vue';
import LfxLineChartNogridSample from '~/components/samples/line-chart-nogrid.sample.vue';
import LfxGeoMapSample from '~/components/samples/geo-map.sample.vue';
import LfxScatterChartSample from '~/components/samples/scatter-chart.sample.vue';
import LfxHeatMapChartSample from '~/components/samples/heat-map-chart.sample.vue';
import LfxGaugeChartSample from '~/components/samples/gauge-chart.sample.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';

const { data } = await useAsyncData('chart-data', () => $fetch('/api/issues-data'));
const { data: scatterCardData } = await useAsyncData('scatter-data', () => $fetch('/api/scatter-data'));
const { data: heatMapData } = await useAsyncData('heat-map-data', () => $fetch('/api/heat-data'));

const chartType = ref<'line' | 'bar' | 'graph-only' | 'geo-map' | 'scatter' | 'heatmap' | 'gauge'>('line');
// const chartTypes = ref([
//   { value: 'line', label: 'Line Chart' },
//   { value: 'bar', label: 'Bar Chart' },
//   { value: 'graph-only', label: 'Graph Only Chart' },
//   { value: 'geo-map', label: 'Geo Map Chart' },
//   { value: 'scatter', label: 'Scatter Chart' },
//   { value: 'heatmap', label: 'Heat Map Chart' },
//   { value: 'gauge', label: 'Gauge Chart' }
// ]);
const chartTypes = ref([
  { value: 'line', label: 'Line Chart', icon: 'fa-solid fa-chart-line' },
  { value: 'bar', label: 'Bar Chart', icon: 'fa-solid fa-chart-bar' },
  { value: 'graph-only', label: 'Graph Only Chart', icon: 'fa-solid fa-chart-line' },
  { value: 'geo-map', label: 'Geo Map Chart', icon: 'fa-solid fa-map' },
  { value: 'scatter', label: 'Scatter Chart', icon: 'fa-solid fa-chart-scatter' },
  { value: 'heatmap', label: 'Heat Map Chart', icon: 'fa-solid fa-chart-tree-map' },
  { value: 'gauge', label: 'Gauge Chart', icon: 'fa-solid fa-gauge' }
]);

const chartData = ref<ChartData[]>(
  convertToChartData(data.value, 'BUCKET_DT_FROM', ['CUMULATIVE_ISSUES', 'ISSUES_OPENED', 'ISSUES_CLOSED'])
);

const scatterChartData = ref<ChartData[]>(convertToChartData(scatterCardData.value, 'DAY', ['COMMITS'], 'HOUR'));
const heatMapChartData = ref<ChartData[]>(convertToChartData(heatMapData.value, 'HOUR', ['COMMITS'], 'DAY'));

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
</script>
