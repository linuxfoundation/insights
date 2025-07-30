<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div :class="props.snapshot ? 'mb-0' : 'mb-6'">
      <div class="flex flex-row flex-wrap justify-between items-start gap-y-3">
        <div>
          <div
            v-if="!isEmpty"
            class="text-neutral-400 text-xs mb-1"
          >
            Total closed issues
          </div>
          <lfx-skeleton-state
            :status="status"
            height="2rem"
            width="7.5rem"
          >
            <div
              v-if="summary && !isEmpty"
              class="flex flex-row flex-wrap gap-4 items-center"
            >
              <div class="text-data-display-1 whitespace-nowrap">{{ formatNumber(summary.current) }}</div>
              <lfx-delta-display
                v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
                :summary="summary"
              />
            </div>
          </lfx-skeleton-state>
        </div>

        <div
          v-if="!isEmpty"
          class="flex flex-col items-end justify-center"
        >
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            <lfx-icon
              name="gauge-high"
              :size="16"
            />
            Avg. velocity
          </span>
          <lfx-skeleton-state
            :status="status"
            height="1.25rem"
            width="4rem"
          >
            <span class="text-xl">{{ avgVelocity }}</span>
          </lfx-skeleton-state>
        </div>
      </div>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching issues resolution data"
      :is-empty="isEmpty"
      use-min-height
      :height="350"
    >
      <div class="w-full h-[350px] mt-5">
        <lfx-chart
          :config="lineAreaChartConfig"
          :animation="!props.snapshot"
        >
          <template #legend>
            <div class="flex flex-row gap-5 items-center justify-center pt-2">
              <div class="flex flex-row items-center gap-2">
                <div class="w-5 border-brand-500 border-b-2 border-solid" />
                <span class="text-xs text-neutral-900">Closed Issues</span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <div class="w-5 border-neutral-600 border-b-2 border-dotted" />
                <span class="text-xs text-neutral-900">Total Issues</span>
              </div>
            </div>
          </template>
        </lfx-chart>
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
import { DateTime } from 'luxon';
import type { IssuesResolution, IssuesResolutionSummary } from '~~/types/development/responses.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, currentInterval } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig, getMarkLine, getVisualMap } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber, formatSecondsToDuration } from '~/components/shared/utils/formatter';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~~/types/shared/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface IssuesResolutionModel {
  granularity: Granularity;
}

const props = defineProps<{
  snapshot?: boolean
}>()

const emit = defineEmits<{
(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: IssuesResolutionModel): void
}>();

const {
  startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();
const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));
const queryKey = computed(() => [
  TanstackKey.ISSUES_RESOLUTION,
  route.params.slug,
  granularity.value,
  selectedReposValues.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<IssuesResolution> = async () => $fetch(
    `/api/project/${route.params.slug}/development/issues-resolution`,
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
} = useQuery<IssuesResolution>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
});

const issuesResolution = computed<IssuesResolution>(() => data.value as IssuesResolution);

const summary = computed<IssuesResolutionSummary>(() => issuesResolution.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(
    (issuesResolution.value?.data || []) as unknown as RawChartData[],
    'dateFrom',
    [
      'closedIssues',
      'totalIssues'
    ],
undefined,
'dateTo'
)
);

const columnBeforeLastItem = computed<string>(() => {
  if (chartData.value.length > 1) {
    const columnBeforeLastItem = chartData.value[chartData.value.length - 2];
    return DateTime.fromISO(columnBeforeLastItem?.key || '').toUTC().endOf('day').toMillis().toString();
  }
  return '';
});

const isLastDataItemIncomplete = computed(() => {
  if (chartData.value.length > 0) {
    const lastItem = chartData.value[chartData.value.length - 1];
    const interval = currentInterval(granularity.value);

    return interval.contains(DateTime.fromISO(lastItem?.key || '').endOf('day'));
  }

  return false;
});

const avgVelocity = computed<string>(() => formatSecondsToDuration(summary.value?.avgVelocityInDays || 0, 'long'));

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Closed Issues',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
    lineWidth: 2,
    markLine: isLastDataItemIncomplete.value ? getMarkLine(columnBeforeLastItem.value) : undefined
  },
  {
    name: 'Total Issues',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    lineStyle: 'dotted',
    color: lfxColors.neutral[500],
    lineWidth: 2
  }
]);

const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  granularity.value,
  undefined,
  isLastDataItemIncomplete.value ? {
    visualMap: getVisualMap(chartData.value.length, chartSeries.value)
  } : undefined
));
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.ISSUES_RESOLUTION);
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
  name: 'LfxProjectIssuesResolution',
}
</script>
