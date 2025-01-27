<template>
  <div class="container mx-auto">
    <h1 class="text-primary-500 mb-20">Sample Page</h1>
    <lfx-card class="p-5"> Sample Card </lfx-card>

    <div class="flex flex-row gap-2">
      <lfx-icon name="circle-info" type="solid" />
      <lfx-icon name="circle-info" type="light" :size="32" />
    </div>

    <div class="flex flex-row gap-2">
      <lfx-button> Line </lfx-button>
      <lfx-button type="secondary"> Bar </lfx-button>
      <!-- <lfx-button type="success"> Success </lfx-button>
      <lfx-button type="danger"> Danger </lfx-button> -->
    </div>

    <lfx-chart :config="lineChartConfig" />
    <lfx-button @click="changeData" class="mt-5"> Change Data </lfx-button>
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

const { data } = await useAsyncData('chart-data', () => $fetch('/api/issues-data'));

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
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: colors.neutral[900],
    lineStyle: 'dashed'
  },
  {
    name: 'Issues Closed',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: colors.brand[500]
  }
]);
const lineChartConfig = computed(() => getLineAreaChartConfig(chartData.value, chartSeries.value));

const changeData = () => {
  const tmp =
    data.value?.map((item: RawChartData) => ({
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
