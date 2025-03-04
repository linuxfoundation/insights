<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Active contributors</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits, issues, or pull requests
      during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div
        v-if="status === 'success'"
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
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching active contributors"
        :is-empty="isEmpty(activeContributors?.data)"
      >
        <lfx-chart :config="barChartConfig" />
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import type { ActiveContributors } from './types/contributors.types';
import type { Summary } from '~/components/shared/types/summary.types';
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
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmpty } from '~/components/shared/utils/helper';

const { startDate, endDate } = storeToRefs(useProjectStore());

const activeTab = ref('weekly');
const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/contributors/active-contributors`,
  {
    params: {
      interval: activeTab,
      repository: route.params.name || '',
      startDate,
      endDate,
    }
  }
);

const activeContributors = computed<ActiveContributors>(() => data.value as ActiveContributors);

const summary = computed<Summary>(() => activeContributors.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(activeContributors.value.data as RawChartData[], 'dateFrom', [
    'contributors'
  ])
);

const tabs = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' }
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributors',
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
      formatter: axisLabelFormatter(activeTab.value === 'weekly' ? 'MMM dd' : 'MMM yyyy')
    }
  }
}));
const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value, configOverride.value));

</script>

<script lang="ts">
export default {
  name: 'LfxProjectActiveContributors'
};
</script>
