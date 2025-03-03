<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Forks
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div
        v-if="status === 'success' && summary"
        class="flex flex-row gap-4 items-center mb-6"
      >
        <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
        <lfx-delta-display
          :summary="summary"
          icon="circle-arrow-up-right"
          icon-type="solid"
        />
      </div>

      <lfx-tabs
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <div class="w-full h-[330px]">
        <lfx-chart
          v-if="status !== 'pending'"
          :config="lineChartConfig"
        />
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import {useFetch, useRoute} from 'nuxt/app';
import {ref, computed, watch} from 'vue';
import {storeToRefs} from "pinia";
import type {ForksData} from './types/popularity.types';
import type {Summary} from '~/components/shared/types/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import {convertToChartData} from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import {getBarChartConfig} from '~/components/uikit/chart/configs/bar.chart';
import {lfxColors} from '~/config/styles/colors';
import {axisLabelFormatter} from '~/components/uikit/chart/helpers/formatters';
import useToastService from '~/components/uikit/toast/toast.service';
import {ToastTypesEnum} from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import {formatNumber} from '~/components/shared/utils/formatter';
import {useProjectStore} from "~/components/modules/project/store/project.store";

const {showToast} = useToastService();
const {startDate, endDate} = storeToRefs(useProjectStore())

const activeTab = ref('cumulative');
const route = useRoute();

const {data, status, error} = useFetch(
    `/api/project/${route.params.slug}/popularity/forks`,
    {
      params: {
        type: activeTab.value,
        repository: route.params.name || '',
        startDate,
        endDate,
      }
    }
);

const forks = computed<ForksData>(() => data.value as ForksData);

const summary = computed<Summary | undefined>(() => forks.value?.summary);
const chartData = computed<ChartData[]>(
    // convert the data to chart data
    () => convertToChartData(forks.value.data as RawChartData[], 'dateFrom', [
      'forks'
    ])
);

const tabs = [
  {label: 'Cumulative', value: 'cumulative'},
  {label: 'New', value: 'new'}
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Forks',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const configOverride = computed(() => ({
  xAxis: {
    axisLabel: {
      formatter: axisLabelFormatter('MMM dd')
    }
  }
}));
const lineChartConfig = computed(() => getBarChartConfig(
    chartData.value,
    chartSeries.value,
    configOverride.value
));

watch(error, (err) => {
  if (err) {
    showToast(
        `Error fetching active contributors: ${error.value?.statusMessage}`,
        ToastTypesEnum.negative,
        undefined,
        10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForks',
}
</script>
