<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="flex justify-between items-center mb-5">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div
          v-if="summary && !isEmpty"
          class="flex flex-row gap-4 items-center"
        >
          <div class="text-data-display-1">{{ medianTimeFormatted }}</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
            :delta-unit="FormatterUnits.SECONDS"
            is-reverse
          />
        </div>
        <div
          v-else
          class="h-11"
        />
      </lfx-skeleton-state>
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching median time to review"
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
import { FormatterUnits } from '~/components/shared/types/formatter.types';
import type { MedianTimeToReview } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfigCustom } from '~/components/uikit/chart/configs/bar.chart';
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
import { maxHours, minHours } from '~/components/uikit/chart/configs/defaults.chart';
import { customTooltipFormatter } from '~/components/uikit/chart/helpers/formatters';

interface MedianTimeToReviewModel extends WidgetModel {
  granularity: Granularity;
  platform?: string;
}

const props = defineProps<{
  modelValue?: MedianTimeToReviewModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: MedianTimeToReviewModel): void;
  (e: 'hasData', value: boolean): void;
}>();

const platform = computed(() => props.modelValue?.platform || '');

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
  platform: platform.value || undefined,
}));

const { data, status, error } = DEVELOPMENT_API_SERVICE.fetchMedianTimeToReview(params);

const medianTimeToReview = computed<MedianTimeToReview>(() => data.value as MedianTimeToReview);

const summary = computed<Summary>(() => medianTimeToReview.value?.summary);
const medianTimeFormatted = computed<string>(() =>
  formatSecondsToDuration(medianTimeToReview.value?.summary?.current || 0, 'short'),
);

const chartData = computed<ChartData[]>(() => {
  const tmpData = convertToChartData(
    (medianTimeToReview.value?.data || []) as RawChartData[],
    'startDate',
    ['medianTime'],
    undefined,
    'endDate',
  );
  return markLastDataItem(tmpData, granularity.value);
});

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Median time to review',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
  },
]);

const configOverride = computed(() => ({
  yAxis: {
    axisLabel: {
      formatter: (value: number) => `${value === 0 ? '' : `${formatSecondsToDuration(value)}`}`,
    },
    min: minHours,
    max: maxHours,
  },
  tooltip: {
    formatter: (params: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataPoint = (params as any)[0];
      const seconds = dataPoint.value;
      const formattedDuration = formatSecondsToDuration(seconds, 'short');
      return customTooltipFormatter(chartData.value, granularity.value, formattedDuration)(params);
    },
  },
}));

const barChartConfig = computed(() =>
  getBarChartConfigCustom(chartData.value, chartSeries.value, {}, granularity.value, configOverride.value),
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

watch(
  status,
  (value: string) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.MEDIAN_TIME_TO_REVIEW);
    }
  },
  {
    immediate: true,
  },
);

watch(
  [granularity, platform],
  ([granularityValue, platformValue]) => {
    emit('update:modelValue', { granularity: granularityValue, platform: platformValue });
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
  name: 'LfxProjectMedianTimeToReview',
};
</script>
