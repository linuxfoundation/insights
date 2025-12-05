<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
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
          <p class="text-data-display-1">{{ medianTimeFormatted }}</p>
          <div
            class="grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[161px] mt-[7px] place-items-start"
          >
            <lfx-delta-display
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
            />
            <p
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime && summary"
              class="text-neutral-400 text-xs mt-[19px]"
            >
              vs. {{ formatSecondsToDuration(summary.previous || 0, 'short') }} last period
            </p>
          </div>
        </div>
      </lfx-skeleton-state>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching median time to merge"
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
import type { MedianTimeToMerge } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatSecondsToDuration } from '~/components/shared/utils/formatter';
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

interface MedianTimeToMergeModel extends WidgetModel {
  granularity: Granularity;
}

const props = defineProps<{
  modelValue?: MedianTimeToMergeModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: MedianTimeToMergeModel): void;
  (e: 'hasData', value: boolean): void;
}>();

const { startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity } =
  storeToRefs(useProjectStore());

const route = useRoute();

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

const { data, status, error } = DEVELOPMENT_API_SERVICE.fetchMedianTimeToMerge(params);

const medianTimeToMerge = computed<MedianTimeToMerge>(() => data.value as MedianTimeToMerge);

const summary = computed<Summary>(() => medianTimeToMerge.value?.summary);
const medianTimeFormatted = computed<string>(() =>
  formatSecondsToDuration(medianTimeToMerge.value?.summary?.current || 0, 'short'),
);

const chartData = computed<ChartData[]>(() => {
  const tmpData = convertToChartData(
    (medianTimeToMerge.value?.data || []) as RawChartData[],
    'startDate',
    ['medianTime'],
    undefined,
    'endDate',
  );
  return markLastDataItem(tmpData, granularity.value);
});

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Median time to merge',
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
      emit('dataLoaded', Widget.MEDIAN_TIME_TO_MERGE);
    }
  },
  {
    immediate: true,
  },
);

watch(
  granularity,
  (value: Granularity) => {
    emit('update:modelValue', { granularity: value });
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
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMedianTimeToMerge',
};
</script>
