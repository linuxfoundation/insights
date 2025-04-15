<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Active organizations</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Organizations that had at least one activity during the selected period, carried out by contributors on their
      behalf.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <lfx-skeleton-state
          :status="summaryLoading ? status : 'success'"
          height="2rem"
          width="7.5rem"
        >
          <div class="flex flex-row gap-4 items-center">
            <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
            <lfx-delta-display
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
            />
          </div>
        </lfx-skeleton-state>
      </div>

      <lfx-tabs
        v-if="!isEmpty && tabs.length > 1"
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching active organizations"
        :is-empty="isEmpty"
      >
        <div class="h-[330px]">
          <lfx-chart :config="barChartConfig" />
        </div>
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
import { granularityTabs } from './config/granularity-tabs';
import type { ActiveOrganizations } from '~~/types/contributors/responses.types';
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
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { links } from '~/config/links';

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const activeTab = ref(granularityTabs[1]?.value || 'weekly');
const route = useRoute();
// just a stub var to watch if the only change was the granularity
const paramWatch = computed(() => ({
  granularity: activeTab.value,
  repository: selectedRepository.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));
const summaryLoading = ref(true);

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/active-organizations`,
  {
    params: {
      granularity: activeTab,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const activeOrganizations = computed<ActiveOrganizations>(() => data.value as ActiveOrganizations);

const summary = computed<Summary>(() => activeOrganizations.value.summary);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((activeOrganizations.value?.data || []) as RawChartData[], 'startDate', [
    'organizations'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = computed(() => granularityTabs.filter((tab) => {
  if (selectedTimeRangeKey.value === dateOptKeys.custom) {
    return customRangeGranularity.value.includes(tab.value);
  }

  return tab.showForKeys.includes(selectedTimeRangeKey.value)
}));

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Organizations',
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

watch(paramWatch, (newParams, oldParams) => {
  let onlyGranularityChanged = newParams.granularity !== oldParams.granularity;
  // check if the only change was the granularity, if not, we need to reset the summary loading
  if (newParams.startDate !== oldParams.startDate
    || newParams.endDate !== oldParams.endDate
    || newParams.repository !== oldParams.repository) {
    onlyGranularityChanged = false;
  }

  summaryLoading.value = !onlyGranularityChanged;
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectActiveOrganizations'
};
</script>
