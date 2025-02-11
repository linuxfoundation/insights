<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Active contributors</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits, issues, or pull requests
      during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div class="flex flex-row gap-4 items-center mb-6">
        <div class="text-data-display-1">4,000</div>
        <lfx-delta-display
          :current="4000"
          :previous="3880"
          icon="circle-arrow-up-right"
          icon-type="solid" />
      </div>

      <lfx-tabs :tabs="tabs" :model-value="activeTab" @update:model-value="handleTabChange" />
      <div class="w-full h-[330px]">
        <lfx-chart :config="barChartConfig" />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useAsyncData } from 'nuxt/app';
import { ref, computed } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';

const activeTab = ref('weekly');
const getData = async (interval: string) => {
  const { data } = await useAsyncData(
    'active-contributors', //
    () => $fetch(`/api/contributors/active-contributors?interval=${interval}`)
  );
  return data.value;
};
const data = ref(await getData(activeTab.value));

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(data.value as RawChartData[], 'contributionDate', ['contributions'])
);

const tabs = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' }
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributions',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value));

const handleTabChange = async (value: string) => {
  activeTab.value = value;
  data.value = await getData(value);
  console.log('data', data.value);
};
</script>

<script lang="ts">
export default {
  name: 'LfxProjectActiveContributors'
};
</script>
