<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Active contributors</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits, issues, or pull requests
      during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <lfx-skeleton-state
          :status="status"
          height="2rem"
          width="7.5rem"
        >
          <div class="flex flex-row gap-4 items-center">
            <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
            <lfx-delta-display
              :summary="summary"
              icon="circle-arrow-up-right"
              icon-type="solid"
            />
          </div>
        </lfx-skeleton-state>
      </div>

      <lfx-tabs
        v-if="!isEmpty"
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching active contributors"
        :is-empty="isEmpty"
      >
        <lfx-chart :config="barChartConfig" />
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import type { ActiveContributors } from './types/contributors.types';
import { granularityTabs } from './config/granularity-tabs';
import type { Summary } from '~~/types/shared/summary.types';
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
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey
} = storeToRefs(useProjectStore());

const activeTab = ref(granularityTabs[0]?.value || 'weekly');
const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/contributors/active-contributors`,
  {
    params: {
      granularity: activeTab,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const activeContributors = computed<ActiveContributors>(() => data.value as ActiveContributors);

const summary = computed<Summary>(() => activeContributors.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(activeContributors.value?.data as RawChartData[], 'startDate', [
    'contributors'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = computed(() => granularityTabs.filter((tab) => tab.showForKeys.includes(selectedTimeRangeKey.value)));

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

const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value, activeTab.value));

watch(selectedTimeRangeKey, () => {
  activeTab.value = tabs.value[0]?.value || 'weekly';
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectActiveContributors'
};
</script>
