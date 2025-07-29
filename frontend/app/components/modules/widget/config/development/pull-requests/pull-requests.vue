<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div>
      <div class="flex flex-row justify-between items-start">
        <div>
          <div class="text-neutral-400 text-xs mb-1">
            Total pull requests performed
          </div>
          <lfx-skeleton-state
            :status="status"
            height="2rem"
            width="7.5rem"
          >
            <div
              v-if="summary && !isEmpty"
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
      </div>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching pull requests"
      :is-empty="isEmpty"
      use-min-height
    >
      <div class="w-full h-[330px] my-5">
        <lfx-chart
          :config="barChartConfig"
          :animation="!props.snapshot"
        />
      </div>

      <div class="flex flex-col gap-4">
        <lfx-project-pull-request-legend-item
          title="Open"
          :delta="openedSummary!"
          :color="chartSeries[0]!.color!"
        />
        <lfx-project-pull-request-legend-item
          title="Merged"
          :delta="mergedSummary!"
          :color="chartSeries[1]!.color!"
        />
        <lfx-project-pull-request-legend-item
          title="Closed"
          :delta="closedSummary!"
          :color="chartSeries[2]!.color!"
        />
      </div>
      <hr
        v-if="!isEmpty"
        class="my-5"
      >
      <div
        v-if="!isEmpty"
        class="flex flex-row items-center justify-between"
      >
        <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
          Avg. velocity
          <lfx-tooltip
            :content="`Average duration between opening of a pull request and its resolution.`"
          >
            <lfx-icon
              name="question-circle"
              :size="16"
            />
          </lfx-tooltip>
        </span>

        <span class="text-xl">{{ avgVelocity }}</span>

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
import type { PullRequests } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfigStackAndLine } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber, formatSecondsToDuration } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import { isEmptyData } from '~/components/shared/utils/helper';
import { barGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~~/types/shared/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxProjectPullRequestLegendItem
  from "~/components/modules/widget/components/development/fragments/pull-request-legend-item.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

interface PullRequestsModel {
  granularity: Granularity;
}

const props = defineProps<{
  snapshot?: boolean;
}>()

const emit = defineEmits<{
(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: PullRequestsModel): void
}>();

const {
  startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const queryKey = computed(() => [
  TanstackKey.PULL_REQUESTS,
  route.params.slug,
  granularity.value,
  selectedReposValues.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<PullRequests> = async () => $fetch(
    `/api/project/${route.params.slug}/development/pull-requests`,
    {
  params: {
    granularity: granularity.value,
    repos: selectedReposValues.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data, status, error, suspense
} = useQuery<PullRequests>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
});

const pullRequests = computed<PullRequests>(() => data.value as PullRequests);

const summary = computed<Summary>(() => pullRequests.value?.summary);
const avgVelocity = computed<string>(() => formatSecondsToDuration(pullRequests.value?.avgVelocityInDays || 0, 'long'));
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    const tmpData = convertToChartData((pullRequests.value?.data || []) as RawChartData[], 'startDate', [
      'open',
      'merged',
      'closed'
    ], undefined, 'endDate');
    return markLastDataItem(tmpData, granularity.value);
  }
);

const openedSummary = computed<Summary | undefined>(() => pullRequests.value?.openedSummary);
const mergedSummary = computed<Summary | undefined>(() => pullRequests.value?.mergedSummary);
const closedSummary = computed<Summary | undefined>(() => pullRequests.value?.closedSummary);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Open',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  },
  {
    name: 'Merged',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.violet[500]
  },
  {
    name: 'Closed',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.neutral[300]
  }
]);

const barChartConfig = computed(() => getBarChartConfigStackAndLine(
  chartData.value,
  chartSeries.value,
  granularity.value
));

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.PULL_REQUESTS);
  }
}, {
  immediate: true
});

watch(granularity, (value) => {
  emit('update:modelValue', { granularity: value });
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPullRequests',
}
</script>
