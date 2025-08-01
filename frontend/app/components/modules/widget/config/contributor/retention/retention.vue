<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div
      v-if="!props.snapshot"
      class="flex flex-row gap-4 items-center mb-10"
    >
      <div class="basis-1/2">
        <lfx-tabs
          :tabs="tabs"
          :model-value="model.activeTab"
          width-type="inline"
          @update:model-value="model.activeTab = $event"
        />
      </div>
      <div class="basis-1/2 flex justify-end">
        <!-- TODO: Hiding for now since the final design is not decided yet -->
        <!-- <lfx-tabs :tabs="chartTypes" :model-value="chartType" width-type="inline"
            @update:model-value="chartType = $event" /> -->
      </div>
    </div>
    <div v-else>
      <div class="text-sm leading-4 font-semibold first-letter:uppercase pb-5">
        {{model.activeTab}} retention breakdown
      </div>
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching retention"
      :is-empty="isEmpty"
      :height="330"
      use-min-height
    >
      <div class="w-full h-[330px]">
        <lfx-chart
          :config="lineAreaChartConfig"
          :animation="!props.snapshot"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from "pinia";
import { DateTime } from 'luxon';
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { convertToChartData, currentInterval } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import { getLineAreaChartConfig, getMarkLine, getVisualMap } from '~/components/uikit/chart/configs/line.area.chart';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import type { Retention } from '~~/types/contributors/responses.types';
import { Granularity } from '~~/types/shared/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface RetentionModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue: RetentionModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: RetentionModel): void
}>();

const model = computed<RetentionModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  startDate, endDate, selectedReposValues
} = storeToRefs(useProjectStore())

const route = useRoute();
/**
 * We're setting a threshold of 180 days for the retention chart
 * Anything below 180 days and we will display the empty state
 */
const isBelowThreshold = computed(() => {
  const start = DateTime.fromISO(startDate.value || '');
  const end = DateTime.fromISO(endDate.value || '');
  const diffInDays = Math.ceil(end.diff(start, 'days').days);
  return diffInDays < 180; // TODO: verify this with Joana and Jonathan
});

const granularity = Granularity.QUARTERLY;

const queryKey = computed(() => [
  TanstackKey.RETENTION,
  route.params.slug,
  granularity,
  model.value.activeTab,
  selectedReposValues,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<Retention[]> = async () => $fetch(
    `/api/project/${route.params.slug}/contributors/retention`,
    {
  params: {
    granularity,
    type: model.value.activeTab,
    repos: selectedReposValues.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {data, status, error} = useQuery<Retention[]>({
  queryKey,
  queryFn: fetchData,
});

const retention = computed<Retention[]>(() => data.value as Retention[]);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    return convertToChartData(
      retention.value as unknown as RawChartData[],
      'startDate',
      ['percentage'],
      undefined,
      'endDate'
    )
  }
);
const isLastDataItemIncomplete = computed(() => {
  if (chartData.value.length > 0) {
    const lastItem = chartData.value[chartData.value.length - 1];
    const interval = currentInterval(granularity);

    return interval.contains(DateTime.fromISO(lastItem?.key || '').endOf('day'));
  }

  return false;
});

const columnBeforeLastItem = computed<string>(() => {
  if (chartData.value.length > 1) {
    const columnBeforeLastItem = chartData.value[chartData.value.length - 2];
    return DateTime.fromISO(columnBeforeLastItem?.key || '').toUTC().endOf('day').toMillis().toString();
  }
  return '';
});

const isEmpty = computed(() => isBelowThreshold.value
  || isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  {
    label: 'Contributors',
    value: 'contributors'
  },
  {
    label: 'Organizations',
    value: 'organizations'
  }
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Retention',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
    markLine: isLastDataItemIncomplete.value ? getMarkLine(columnBeforeLastItem.value) : undefined
  }
]);

const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value, //
  chartSeries.value, //
  granularity,
  (value: number, index?: number) => `${index === 0 ? '' : `${value}%`}`,
  isLastDataItemIncomplete.value ? {
    visualMap: getVisualMap(chartData.value.length, chartSeries.value)
  } : undefined
));

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.RETENTION);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectRetention'
};
</script>
