<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <p
      v-if="props.snapshot"
      class="text-body-2 text-neutral-400 pb-3"
    >
      {{ searchQueriesConfig.description(project!) }}
    </p>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching search queries volume"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px]">
        <lfx-chart
          :config="barChartConfig"
          :animation="!props.snapshot"
        />
      </div>
      <div class="flex justify-center items-center gap-2 text-xs text-neutral-400 mt-5">
        <lfx-icon
          name="info-circle"
          type="regular"
          :size="12"
        />
        Data available from June 2024 onward
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, onServerPrefetch, watch } from 'vue';
import { storeToRefs } from "pinia";
import { DateTime } from 'luxon';
import searchQueriesConfig from './search-queries.config'
import type { SearchQueries } from '~~/types/popularity/responses.types';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { lfxColors } from '~/config/styles/colors';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { Granularity } from '~~/types/shared/granularity';
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { POPULARITY_API_SERVICE } from '~/components/modules/widget/services/popularity.api.service';

const props = defineProps<{
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'dataLoaded', value: string): void}>();

const {
  startDate,
  endDate,
  selectedReposValues,
  project,
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => Granularity.MONTHLY);

const queryParams = computed(() => ({
  projectSlug: route.params.slug as string,
  granularity: granularity.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));

const {
  data, status, error, suspense
} = POPULARITY_API_SERVICE.fetchSearchQueries(queryParams);

onServerPrefetch(async () => {
  await suspense();
});

const searchQueries = computed<SearchQueries>(() => data.value as SearchQueries);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    let tmpData = convertToChartData((searchQueries.value?.data || []) as RawChartData[], 'startDate', [
    'queryCount'
  ], undefined, 'endDate');

  return markLastDataItem(tmpData, granularity.value);
  }
);

const dateDuration = computed(() => {
  const start = DateTime.fromISO(startDate.value || '');
  const end = DateTime.fromISO(endDate.value || '');
  const duration = end.diff(start, 'days').days;

  return duration;
})
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[])
|| dateDuration.value < 30);

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

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.SEARCH_QUERIES);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSearchQueries',
}
</script>
