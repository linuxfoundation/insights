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

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching social mentions"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px] mt-5">
        <lfx-chart :config="barChartConfig" />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { SearchQueries } from '~~/types/popularity/responses.types';
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
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { barGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

const {
  startDate,
  endDate,
  selectedRepository,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));

const queryKey = computed(() => [
  TanstackKey.SEARCH_QUERIES,
  route.params.slug,
  granularity.value,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<SearchQueries> = async () => $fetch(
    `/api/project/${route.params.slug}/popularity/search-queries`,
    {
  params: {
    granularity: granularity.value,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data, status, error, suspense
} = useQuery<SearchQueries>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense();
});

const searchQueries = computed<SearchQueries>(() => data.value as SearchQueries);

const summary = computed<Summary>(() => searchQueries.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((searchQueries.value?.data || []) as RawChartData[], 'startDate', [
    'queryCount'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Search Queries',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const barChartConfig = computed(() => getBarChartConfig(
  chartData.value,
  chartSeries.value,
  granularity.value
));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSearchQueries',
}
</script>
