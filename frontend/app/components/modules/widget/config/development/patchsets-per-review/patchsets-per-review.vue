<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="bg-neutral-50 flex gap-1 items-start p-1 rounded-lg mb-5">
      <button
        :class="[
          'flex-1 px-4 py-0.5 rounded-md text-sm font-medium transition-colors',
          dataType === 'median' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900',
        ]"
        @click="dataType = 'median'"
      >
        Median
      </button>
      <button
        :class="[
          'flex-1 px-4 py-0.5 rounded-md text-sm font-medium transition-colors',
          dataType === 'average' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-900',
        ]"
        @click="dataType = 'average'"
      >
        Average
      </button>
    </div>

    <div class="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start">
      <lfx-skeleton-state
        :status="status"
        height="2.5rem"
        width="10rem"
      >
        <div
          v-if="summary && !isEmpty"
          class="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start"
        >
          <p class="text-data-display-1">{{ formatNumber(summary.current, 1) }}</p>
          <div class="grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[76px] mt-[7px] place-items-start">
            <lfx-delta-display
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
              :decimals="1"
            />
            <p
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime && summary"
              class="text-neutral-400 text-xs mt-[19px]"
            >
              vs. {{ formatNumber(summary.previous || 0, 1) }} last period
            </p>
          </div>
        </div>
      </lfx-skeleton-state>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching patchsets per review"
      :is-empty="isEmpty"
      use-min-height
    >
      <div class="w-full h-[330px] my-5">
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
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { PatchsetsPerReview } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { isEmptyData } from '~/components/shared/utils/helper';
import { barGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { Granularity } from '~~/types/shared/granularity';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { Widget } from '~/components/modules/widget/types/widget';
import {
  DEVELOPMENT_API_SERVICE,
  type QueryParams,
} from '~/components/modules/widget/services/development.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

interface PatchsetsPerReviewModel extends WidgetModel {
  granularity: Granularity;
  dataType: 'median' | 'average';
}

const props = defineProps<{
  modelValue?: PatchsetsPerReviewModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: PatchsetsPerReviewModel): void;
  (e: 'hasData', value: boolean): void;
}>();

const { startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity } =
  storeToRefs(useProjectStore());

const route = useRoute();

const dataType = ref<'median' | 'average'>(props.modelValue?.dataType || 'median');

const granularity = computed(() =>
  selectedTimeRangeKey.value === dateOptKeys.custom
    ? (customRangeGranularity.value[0] as Granularity)
    : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities],
);

const params = computed<QueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: granularity.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));

const { data, status, error } = DEVELOPMENT_API_SERVICE.fetchPatchsetsPerReview(params);

const patchsetsPerReview = computed<PatchsetsPerReview>(() => data.value as PatchsetsPerReview);

const summary = computed<Summary>(() => {
  if (!patchsetsPerReview.value?.data) return {} as Summary;

  const currentData = patchsetsPerReview.value.data;
  const dataKey = dataType.value;

  // Calculate current and previous values
  const current = currentData.reduce((sum, item) => sum + (item[dataKey] || 0), 0) / (currentData.length || 1);
  const previous = patchsetsPerReview.value.summary?.previous || 0;
  const change = current - previous;
  const changePercentage = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    current,
    previous,
    change,
    changePercentage,
  };
});

const chartData = computed<ChartData[]>(() => {
  const tmpData = convertToChartData(
    (patchsetsPerReview.value?.data || []) as RawChartData[],
    'startDate',
    [dataType.value],
    undefined,
    'endDate',
  );
  return markLastDataItem(tmpData, granularity.value);
});

const chartSeries = ref<ChartSeries[]>([
  {
    name: dataType.value === 'median' ? 'Median patchsets' : 'Average patchsets',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
  },
]);

const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value, granularity.value));

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

watch(
  status,
  (value: string) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.PATCHSETS_PER_REVIEW);
    }
  },
  {
    immediate: true,
  },
);

watch(
  [granularity, dataType],
  ([granularityValue, dataTypeValue]) => {
    emit('update:modelValue', { granularity: granularityValue, dataType: dataTypeValue });
  },
  { immediate: true },
);

watch(
  isEmpty,
  (value: boolean) => {
    emit('hasData', !value);
  },
  {
    immediate: true,
  },
);

watch(dataType, () => {
  chartSeries.value[0]!.name = dataType.value === 'median' ? 'Median patchsets' : 'Average patchsets';
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPatchsetsPerReview',
};
</script>
