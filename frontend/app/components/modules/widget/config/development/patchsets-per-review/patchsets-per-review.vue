<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="mb-5">
      <lfx-tabs
        v-if="!isEmpty && !props.snapshot"
        v-model="dataType"
        :tabs="dataTypeTabs"
        width-type="full"
      />
      <div
        v-if="props.snapshot"
        class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
      >
        {{ props.modelValue?.dataType }} patchsets per review
      </div>
    </div>

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
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
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
  type PatchsetsPerReviewQueryParams,
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

const dataTypeTabs = [
  { value: 'median', label: 'Median' },
  { value: 'average', label: 'Average' },
];

const dataType = ref<'median' | 'average'>(props.modelValue?.dataType || 'median');

const granularity = computed(() =>
  selectedTimeRangeKey.value === dateOptKeys.custom
    ? (customRangeGranularity.value[0] as Granularity)
    : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities],
);

const params = computed<PatchsetsPerReviewQueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: granularity.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  dataType: dataType.value,
}));

const { data, status, error } = DEVELOPMENT_API_SERVICE.fetchPatchsetsPerReview(params);

const patchsetsPerReview = computed<PatchsetsPerReview>(() => data.value as PatchsetsPerReview);

const summary = computed<Summary | undefined>(() => {
  return patchsetsPerReview.value?.summary;
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

const barChartConfig = computed(() =>
  getBarChartConfig(chartData.value, chartSeries.value, granularity.value, false, 1),
);

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
    emit('update:modelValue', { ...props.modelValue, granularity: granularityValue, dataType: dataTypeValue });
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
