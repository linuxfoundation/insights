<template>
  <div
    style="height: 280px;"
    class="w-full"
  >
    <lfx-chart :config="radarChartConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getRadarChartConfig, type RadarIndicator } from '~/components/uikit/chart/configs/radar.chart';
import { lfxColors } from '~/config/styles/colors';
import type { ChartSeries, ChartData } from '~~/app/components/uikit/chart/types/ChartTypes';

const props = defineProps<{
  chartData: ChartData[];
}>();

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Trust Score',
    type: 'radar',
    yAxisIndex: 0,
    dataIndex: 0,
    color: lfxColors.brand[500]
  }
]);
const radarIndicators = ref<RadarIndicator[]>([
  {
    key: 'popularity',
    name: 'Popularity',
  },
  {
    key: 'contributors',
    name: 'Contributors',
  },
  {
    key: 'security',
    name: 'Security & Best Practices',
  },
  {
    key: 'development',
    name: 'Development',
  }
]);

const radarChartConfig = computed(() => getRadarChartConfig(props.chartData, chartSeries.value, radarIndicators.value));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreChart'
};
</script>
