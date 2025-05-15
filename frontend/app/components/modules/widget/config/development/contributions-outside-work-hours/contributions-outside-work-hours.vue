<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="flex flex-row justify-between items-center mb-6">
      <div>
        <lfx-skeleton-state
          :status="status"
          height="2rem"
          width="7.5rem"
        >
          <div class="flex flex-row gap-4 items-center grow">
            <div class="text-data-display-1">{{ formatNumber(summary.current) }}%</div>
            <lfx-delta-display
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
              percentage-only
              unit="%"
              is-reverse
            />
          </div>
        </lfx-skeleton-state>
      </div>

      <div class="flex flex-row justify-between items-center mb-6 gap-10">
        <div class="flex flex-col items-end justify-center">
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            Mon-Fri (after 18:00)
          </span>
          <lfx-skeleton-state
            :status="status"
            height="1.25rem"
            width="4rem"
          >
            <span
              v-if="status === 'success'"
              class="text-xl"
            >
              {{ formatNumber(weekdayPercentage, 1) }}%
            </span>
          </lfx-skeleton-state>
        </div>
        <div class="flex flex-col items-end justify-center">
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            Weekends
          </span>
          <lfx-skeleton-state
            :status="status"
            height="1.25rem"
            width="4rem"
          >
            <span
              v-if="status === 'success'"
              class="text-xl"
            >
              {{ formatNumber(weekendPercentage, 1) }}%
            </span>
          </lfx-skeleton-state>
        </div>
      </div>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching contributions outside work hours"
      :is-empty="isEmpty"
      use-min-height
      :height="430"
    >
      <div class="w-full h-[430px] my-5">
        <lfx-chart :config="getScatterChartConfig(chartData, chartSeries)" />
      </div>
      <div class="text-neutral-400 text-xs text-center italic">
        Only considering contributions from contributors with known timezones
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 ref, computed, onServerPrefetch, watch
} from 'vue';
import { storeToRefs } from "pinia";
import {useQuery} from "@tanstack/vue-query";
import type { ContributionOutsideHours } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { lfxColors } from '~/config/styles/colors';
import { getScatterChartConfig } from '~/components/uikit/chart/configs/scatter.chart';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {BenchmarkKeys, type Benchmark} from '~~/types/shared/benchmark.types';

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark | undefined): void;
}>();

const {
 startDate, endDate, selectedRepository, selectedTimeRangeKey
} = storeToRefs(useProjectStore())

const route = useRoute();

const queryKey = computed(() => [
  TanstackKey.CONTRIBUTIONS_OUTSIDE_WORK_HOURS,
  route.params.slug,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData = async () => $fetch(`/api/project/${route.params.slug}/development/contribution-outside`, {
  params: {
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  },
});

const {
  data, status, error, suspense
} = useQuery({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense();
});

const contributionOutsideHours = computed<ContributionOutsideHours>(() => data.value as ContributionOutsideHours);
const summary = computed<Summary>(() => contributionOutsideHours.value.summary);
const weekdayPercentage = computed<number>(() => contributionOutsideHours.value.weekdayOutsideHoursPercentage);
const weekendPercentage = computed<number>(() => contributionOutsideHours.value.weekendOutsideHoursPercentage);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(
    (contributionOutsideHours.value?.data || []) as RawChartData[],
    'day',
    ['contributions'],
    'hour'
  )
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributions',
    type: 'scatter',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const callEmit = () => {
  emit('update:benchmarkValue', status.value === 'success' ? {
    key: BenchmarkKeys.ContributionsOutsideWorkHours,
    value: weekdayPercentage.value + weekendPercentage.value,
  } : undefined);
}

callEmit();

watch(chartData, callEmit);

</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributionsOutsideWorkHours',
}
</script>
