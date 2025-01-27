<template>
  <div class="container mx-auto">
    <h1 class="text-primary-500 mb-20">Sample Page</h1>
    <lfx-card class="p-5"> Sample Card </lfx-card>

    <div class="flex flex-row gap-2">
      <lfx-icon name="circle-info" type="solid" />
      <lfx-icon name="circle-info" type="light" :size="32" />
    </div>

    <div class="flex flex-row gap-2">
      <lfx-button @click="changeChartType('line')"> Line </lfx-button>
      <lfx-button type="secondary" @click="changeChartType('bar')"> Bar </lfx-button>
      <lfx-button type="success" @click="changeChartType('bar', true)"> Stacked Bar </lfx-button>
      <!-- <lfx-button type="danger"> Danger </lfx-button> -->
    </div>

    <lfx-chart :config="chartType === 'line' ? lineChartConfig : barChartConfig" />
    <lfx-button class="mt-5" @click="changeData"> Change Data </lfx-button>
  </div>
</template>

<script setup lang="ts">
import LfxCard from '@/components/uikit/card/Card.vue';
import LfxButton from '@/components/uikit/button/button.vue';
import LfxIcon from '@/components/uikit/icon/Icon.vue';
import LfxChart from '@/components/uikit/chart/Chart.vue';
import { convertToChartData } from '@/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, ChartSeries, RawChartData } from '@/components/uikit/chart/types/ChartTypes';
import { getLineAreaChartConfig } from '@/components/uikit/chart/configs/line.area.chart';
import colors from '@/assets/constants/colors.json';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';

const { data } = await useAsyncData('chart-data', () => $fetch('/api/issues-data'));

const chartType = ref<'line' | 'bar'>('line');
const showStackedBar = ref(false);
const chartData = ref<ChartData[]>(
  convertToChartData(data.value, 'BUCKET_DT_FROM', ['CUMULATIVE_ISSUES', 'ISSUES_OPENED', 'ISSUES_CLOSED'])
);
const chartSeries = ref<ChartSeries[]>([
  // {
  //   name: 'Cumulative Issues',
  //   type: 'line',
  //   yAxisIndex: 0,
  //   dataIndex: 0,
  //   position: 'left',
  //   color: colors.negative[900]
  // },
  {
    name: 'Issues Opened',
    type: chartType.value,
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: colors.positive[500],
    lineStyle: 'dashed'
  },
  {
    name: 'Issues Closed',
    type: chartType.value,
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: colors.brand[500]
  }
]);
const lineChartConfig = computed(() => getLineAreaChartConfig(chartData.value, chartSeries.value));
const barChartConfig = computed(
  () => getBarChartConfig(chartData.value, chartSeries.value, { stack: showStackedBar.value ? 'stack' : undefined })
  // TODO: fix auto lint fixer for this, has different max-len value
);

const changeChartType = (type: 'line' | 'bar', stacked: boolean = false) => {
  chartType.value = type;
  chartSeries.value = chartSeries.value.map((series) => ({ ...series, type }));
  showStackedBar.value = stacked;
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
</script>
