<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="flex justify-between items-center">
      <lfx-skeleton-state
        :status="status"
        height="2.75rem"
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

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching review efficiency"
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
import type { ReviewEfficiency } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
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

interface ReviewEfficiencyModel extends WidgetModel {
  granularity: Granularity;
  platform?: string;
}

const props = defineProps<{
  modelValue?: ReviewEfficiencyModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: ReviewEfficiencyModel): void;
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

const { data, status, error } = DEVELOPMENT_API_SERVICE.fetchReviewEfficiency(params);

const reviewEfficiency = computed<ReviewEfficiency>(() => data.value as ReviewEfficiency);

const summary = computed<Summary>(() => reviewEfficiency.value?.summary);
const chartData = computed<ChartData[]>(() => {
  const tmpData = convertToChartData(
    (reviewEfficiency.value?.data || []) as RawChartData[],
    'startDate',
    ['opened', 'closed'],
    undefined,
    'endDate',
  );
  return markLastDataItem(tmpData, granularity.value);
});

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Opened',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
  },
  {
    name: 'Closed',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.neutral[600],
  },
]);

const barChartConfig = computed(() => getLineAreaChartConfig(chartData.value, chartSeries.value, granularity.value));

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

watch(
  status,
  (value: string) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.REVIEW_EFFICIENCY);
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
  name: 'LfxProjectReviewEfficiency',
};
</script>
