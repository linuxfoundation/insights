<template>
  <section class="mt-5">
    <div class="mb-6">
      <lfx-skeleton-state
        :status="activeTab === 'cumulative' ? cumulativeStatus : status"
        height="2rem"
        width="7.5rem"
      >
        <div
          v-if="summary"
          class="flex flex-row gap-4 items-center"
        >
          <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
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
      :status="activeTab === 'cumulative' ? cumulativeStatus : status"
      :error="activeTab === 'cumulative' ? cumulativeError : error"
      error-message="Error fetching stars"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[330px] mt-4">
        <lfx-chart :config="activeTab === 'cumulative' ? lineChartConfig : barChartConfig" />
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
import type { StarsData } from '~~/types/popularity/responses.types';
import { lineGranularities, barGranularities } from '~/components/shared/types/granularity';
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
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark): void;
}>();

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const activeTab = ref('new');
const route = useRoute();

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const lineGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const barQueryKey = computed(() => [
  TanstackKey.STARS,
  route.params.slug,
  barGranularity.value,
  'new',
  'star',
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchBarData: QueryFunction<StarsData> = async () => $fetch(
`/api/project/${route.params.slug}/popularity/stars`,
    {
    params: {
      granularity: barGranularity.value,
      type: 'new',
      countType: 'new',
      activityType: 'star',
      repository: selectedRepository.value,
      startDate: startDate.value,
      endDate: endDate.value,
    },
  }
);

const {
  data,
  status,
  error,
  suspense: barSuspense
} = useQuery<StarsData>({
  queryKey: barQueryKey,
  queryFn: fetchBarData,
});

const lineQueryKey = computed(() => [
  TanstackKey.STARS_CUMULATIVE,
  route.params.slug,
  lineGranularity.value,
  'cumulative',
  'star',
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchLineData: QueryFunction<StarsData> = async () => $fetch(
    `/api/project/${route.params.slug}/popularity/stars`,
    {
  params: {
    granularity: lineGranularity.value,
    type: 'cumulative',
    countType: 'cumulative',
    activityType: 'star',
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data: cumulativeData,
  status: cumulativeStatus,
  error: cumulativeError,
  suspense: lineSuspense
} = useQuery<StarsData>({
  queryKey: lineQueryKey,
  queryFn: fetchLineData,
});

onServerPrefetch(async () => {
  await Promise.all([barSuspense(), lineSuspense()]);
});

const stars = computed<StarsData | undefined>(() => (activeTab.value === 'cumulative'
  ? cumulativeData.value as StarsData
  : data.value as StarsData));
const cumulativeStarsCount = computed<number>(() => {
  const cumulativeStars = (cumulativeData.value as StarsData)?.data;

  return cumulativeStars && cumulativeStars.length > 0
    ? cumulativeStars[cumulativeStars.length - 1]!.stars : 0;
});

const summary = computed<Summary | undefined>(() => stars.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(stars.value?.data as RawChartData[], 'startDate', [
    'stars'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New', value: 'new' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Stars',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  lineGranularity.value
));
const barChartConfig = computed(() => getBarChartConfig(
  chartData.value,
  chartSeries.value,
  barGranularity.value
));

emit('update:benchmarkValue', {
    key: BenchmarkKeys.Stars,
    value: cumulativeStarsCount.value
  });

watch(cumulativeStatus, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.Stars,
    value: cumulativeStarsCount.value
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectStars',
}
</script>
