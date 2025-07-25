<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="mb-5">
      <div class="flex flex-row justify-between items-start">
        <div>
          <div
            v-if="!isEmpty"
            class="text-neutral-400 text-xs mb-1"
          >
            Total active days
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

        <div
          v-if="!isEmpty"
          class="flex flex-col items-end justify-center"
        >
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            Avg. contributions per {{ granularityDisplay }}
          </span>
          <lfx-skeleton-state
            :status="status"
            height="1.25rem"
            width="4rem"
          >
            <span class="text-xl">
              {{ formatNumber(activeDays.avgContributions) }}
            </span>
          </lfx-skeleton-state>
        </div>
      </div>
    </div>

    <div
      v-if="!isEmpty"
      class="mb-5 text-neutral-900 font-medium"
    >Contributions per {{ granularityDisplay }}</div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching active days"
      :is-empty="isEmpty"
      use-min-height
      :height="100"
    >
      <div class="w-full h-[100px]">
        <lfx-chart
          :config="getHeatMapChartConfig(chartData, chartSeries, categoryData, granularityDisplay)"
          :animation="!props.snapshot"
        />
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
import type { ActiveDays } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, convertToCategoryData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries,
  CategoryData
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getHeatMapChartConfig } from '~/components/uikit/chart/configs/heat-map.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~~/types/shared/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface ActiveDaysModel {
  granularity: Granularity;
}

const props = defineProps<{
  snapshot?: boolean;
}>()

const emit = defineEmits<{
(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: ActiveDaysModel): void
}>();

const {
  startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const granularityDisplay = computed(() => {
  switch (granularity.value) {
    case Granularity.WEEKLY:
      return 'week';
    case Granularity.MONTHLY:
      return 'month';
    case Granularity.YEARLY:
      return 'year';
    default:
      return 'day';
  }
});
const queryKey = computed(() => [
  TanstackKey.ACTIVE_DAYS,
  route.params.slug,
  granularity.value,
  selectedReposValues.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<ActiveDays> = async () => $fetch(
    `/api/project/${route.params.slug}/development/active-days`,
    {
      params: {
        granularity: granularity.value,
        repos: selectedReposValues.value,
        startDate: startDate.value,
        endDate: endDate.value,
      },
    }
);

const {
data, status, error, suspense
} = useQuery<ActiveDays>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense();
});

const activeDays = computed<ActiveDays>(() => data.value as ActiveDays);

const summary = computed<Summary>(() => activeDays.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((activeDays.value?.data || []) as RawChartData[], 'day', [
    'contributions'
  ])
);
const categoryData = computed<CategoryData>(() => convertToCategoryData(chartData.value, [{ key: '0', values: [0] }]));

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributions',
    type: 'heatmap',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[700]
  }
]);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));


watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.ACTIVE_DAYS);
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
  name: 'LfxProjectActiveDays',
}
</script>
