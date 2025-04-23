<template>
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
      error-message="Error fetching active contributors"
      :is-empty="isEmpty"
    >
      <div class="h-[330px]">
        <lfx-chart :config="barChartConfig" />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
ref, computed, watch, onServerPrefetch
} from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { ActiveContributors } from '~~/types/contributors/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
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
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import {TanstackKey} from "~/components/shared/types/tanstack";
import {granularityTabs} from "~/components/modules/widget/components/contributors/config/granularity-tabs";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark): void;
}>();

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore());

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

const queryKey = computed(() => [
  TanstackKey.ACTIVE_CONTRIBUTORS,
  route.params.slug,
  activeTab,
  selectedRepository,
  startDate,
  endDate,
]);

const fetchData: QueryFunction<ActiveContributors> = async () => $fetch(
    `/api/project/${route.params.slug}/contributors/active-contributors`,
    {
  params: {
    granularity: activeTab.value,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
data, status, error, suspense
} = useQuery<ActiveContributors>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
})

const activeContributors = computed<ActiveContributors>(() => data.value as ActiveContributors);

const summary = computed<Summary>(() => activeContributors.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(activeContributors.value?.data as RawChartData[], 'startDate', [
    'contributors'
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

emit('update:benchmarkValue', {
    key: BenchmarkKeys.ActiveContributors,
    value: summary.value?.current || 0
  });

watch(activeContributors, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.ActiveContributors,
    value: summary.value.current
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectActiveContributors'
};
</script>
