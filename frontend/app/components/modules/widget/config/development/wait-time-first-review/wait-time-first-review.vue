<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="mb-5">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div
          v-if="summary && !isEmpty"
          class="flex flex-row gap-4 items-center"
        >
          <div class="text-data-display-1">{{ currentSummary }}</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
            is-duration
            is-reverse
          />
        </div>
      </lfx-skeleton-state>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching wait time for 1st review"
      :is-empty="isEmpty"
      use-min-height
      :height="330"
    >
      <div class="w-full h-[330px]">
        <lfx-chart
          :config="barChartConfig"
          :animation="!props.snapshot"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 ref, computed, watch
} from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { WaitTime1stReview } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfigCustom } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { barGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import { minHours, maxHours } from '~/components/uikit/chart/configs/defaults.chart';

const props = defineProps<{
  snapshot?: boolean;
}>()

const emit = defineEmits<{(e: 'dataLoaded', value: string): void}>();

const {
  startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const queryKey = computed(() => [
  TanstackKey.WAIT_TIME_FIRST_REVIEW,
  route.params.slug,
  granularity,
  selectedReposValues,
  startDate,
  endDate,
]);

const fetchData: QueryFunction<WaitTime1stReview> = async () => $fetch(
    `/api/project/${route.params.slug}/development/wait-time-1st-review`,
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
  data, status, error
} = useQuery<WaitTime1stReview>({
  queryKey,
  queryFn: fetchData,
});

const waitTime1stReview = computed<WaitTime1stReview>(() => data.value as WaitTime1stReview);

const summary = computed<Summary>(() => waitTime1stReview.value.summary);
const currentSummary = computed<string>(() => formatSecondsToDuration(summary.value?.current || 0, 'long'));
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    const tmpData = convertToChartData((waitTime1stReview.value?.data || []) as RawChartData[], 'startDate', [
      'waitTime'
    ], undefined, 'endDate');
    return markLastDataItem(tmpData, granularity.value).map(chartDataMapper);
  }
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Wait time for 1st review',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const configOverride = computed(() => ({
  yAxis: {
    axisLabel: {
      formatter: (value: number) => `${value === 0 ? '' : `${value}h`}`
    },
    min: minHours,
    max: maxHours,
  }
}));

const barChartConfig = computed(() => getBarChartConfigCustom(
  chartData.value,
  chartSeries.value,
  {},
  granularity.value,
  configOverride.value
));
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const chartDataMapper = (d: ChartData) => ({
    ...d,
    values: d.values.map((v) => Number(formatSecondsToDuration(v, 'no')))
  })

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.WAIT_TIME_FIRST_REVIEW);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForksWaitTimeFirstReview',
}
</script>
