<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
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
      v-if="!isEmpty && !props.snapshot"
      :tabs="tabs"
      :model-value="model.activeTab"
      @update:model-value="model.activeTab = $event"
    />
    <div
      v-if="props.snapshot"
      class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
    >
      <span v-if="model.activeTab === 'new'">{{barGranularity}} new commits</span>
      <span v-else>{{lineGranularity}} commit growth</span>
    </div>
    <lfx-project-load-state
      :status="model.activeTab === 'cumulative' ? cumulativeStatus : status"
      :error="model.activeTab === 'cumulative' ? cumulativeError : error"
      error-message="Error fetching commit activities"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[330px] mt-4">
        <lfx-chart
          :config="model.activeTab === 'cumulative' ? lineChartConfig : barChartConfig"
          :animation="!props.snapshot"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 computed, watch, onServerPrefetch
} from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { CommitActivities } from '~~/types/popularity/responses.types';
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
import {Widget} from "~/components/modules/widget/types/widget";

interface CommitActivitiesModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue: CommitActivitiesModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: CommitActivitiesModel): void;
  (e: 'update:benchmarkValue', value: Benchmark | undefined): void;
  (e: 'dataLoaded', value: string): void;
}>();

const model = computed<CommitActivitiesModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  startDate, endDate, selectedRepoSlugs, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const lineGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const barQueryKey = computed(() => [
  TanstackKey.COMMIT_ACTIVITIES,
  route.params.slug,
  barGranularity.value,
  'new',
  'authored-commit',
  selectedRepoSlugs.value,
  startDate.value,
  endDate.value,
]);

const fetchBarData: QueryFunction<CommitActivities> = async () => $fetch(
`/api/project/${route.params.slug}/development/commit-activities`,
    {
    params: {
      granularity: barGranularity.value,
      type: 'new',
      countType: 'new',
      activityType: 'authored-commit',
      repos: selectedRepoSlugs.value,
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
} = useQuery<CommitActivities>({
  queryKey: barQueryKey,
  queryFn: fetchBarData,
});

const lineQueryKey = computed(() => [
  TanstackKey.COMMIT_ACTIVITIES,
  route.params.slug,
  lineGranularity.value,
  'cumulative',
  'authored-commit',
  selectedRepoSlugs.value,
  startDate.value,
  endDate.value,
]);

const fetchLineData: QueryFunction<CommitActivities> = async () => $fetch(
    `/api/project/${route.params.slug}/development/commit-activities`,
    {
  params: {
    granularity: lineGranularity.value,
    type: 'cumulative',
    countType: 'cumulative',
    activityType: 'authored-commit',
    repos: selectedRepoSlugs.value,
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
} = useQuery<CommitActivities>({
  queryKey: lineQueryKey,
  queryFn: fetchLineData,
});

onServerPrefetch(async () => {
  await Promise.all([barSuspense(), lineSuspense()]);
});

const commitActivities = computed<CommitActivities | undefined>(() => (model.value.activeTab === 'cumulative'
  ? cumulativeData.value as CommitActivities
  : data.value as CommitActivities));
const cumulativeCount = computed<number>(() => {
  const cumulativeCommitActivities = (cumulativeData.value as CommitActivities)?.data;

  return cumulativeCommitActivities && cumulativeCommitActivities.length > 0
    ? cumulativeCommitActivities[cumulativeCommitActivities.length - 1]!.commits : 0;
});

const summary = computed<Summary | undefined>(() => commitActivities.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(commitActivities.value?.data as RawChartData[], 'startDate', [
    'commits'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New', value: 'new' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Commits',
    type: model.value.activeTab === 'cumulative' ? 'line' : 'bar',
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

const callEmit = () => {
  emit('update:benchmarkValue', status.value === 'success' ? {
    key: BenchmarkKeys.CommitActivities,
    value: cumulativeCount.value
  } : undefined);
}

callEmit();

watch(cumulativeStatus, () => {
  callEmit();
});

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.COMMIT_ACTIVITIES);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCommitActivities',
}
</script>
