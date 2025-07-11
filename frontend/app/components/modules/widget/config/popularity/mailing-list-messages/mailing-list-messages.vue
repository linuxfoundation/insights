<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="mb-6">
      <lfx-skeleton-state
        :status="model.activeTab === 'cumulative' ? cumulativeStatus : status"
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

    <lfx-tabs
      v-if="!isEmpty && !props.snapshot"
      :tabs="tabs"
      :model-value="model.activeTab"
      @update:model-value="model.activeTab = $event"
    />
    <div
      v-if="props.snapshot"
      class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
    >
      <span v-if="model.activeTab === 'new-mentions'">{{barGranularity}} new messages</span>
      <span v-else>{{lineGranularity}} messages growth</span>
    </div>
    <lfx-project-load-state
      :status="model.activeTab === 'cumulative' ? cumulativeStatus : status"
      :error="model.activeTab === 'cumulative' ? cumulativeError : error"
      error-message="Error fetching mailing lists messages"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[330px] mt-4">
        <lfx-chart
          :config="model.activeTab === 'cumulative' ? lineChartConfig : barChartConfig"
          :animation="!props.snapshot"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import {
 computed, watch, onServerPrefetch
} from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type {MailingListsMessages} from '~~/types/popularity/responses.types';
import { lineGranularities, barGranularities } from '~/components/shared/types/granularity';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface MailingListMessagesModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue: MailingListMessagesModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: MailingListMessagesModel): void;
  (e: 'update:benchmarkValue', value: Benchmark | undefined): void;
  (e: 'dataLoaded', value: string): void;
}>();

const model = computed<MailingListMessagesModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const lineGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const barQueryKey = computed(() => [
  TanstackKey.MAILING_LISTS_MESSAGES,
  route.params.slug,
  selectedReposValues,
  startDate,
  endDate,
  barGranularity,
]);

const fetchBarData: QueryFunction<MailingListsMessages> = async () => $fetch(
    `/api/project/${route.params.slug}/popularity/mailing-lists-messages`,
    {
  params: {
    granularity: barGranularity.value,
    type: 'new',
    countType: 'new',
    activityType: 'message',
    repos: selectedReposValues.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data,
  status,
  error,
  suspense: barSuspense
} = useQuery<MailingListsMessages>({
  queryKey: barQueryKey,
  queryFn: fetchBarData,
});

const lineQueryKey = computed(() => [
  TanstackKey.MAILING_LISTS_MESSAGES,
  route.params.slug,
  selectedReposValues,
  startDate,
  endDate,
  lineGranularity,
]);

const fetchLineData: QueryFunction<MailingListsMessages> = async () => $fetch(
    `/api/project/${route.params.slug}/popularity/mailing-lists-messages`,
    {
  params: {
    granularity: lineGranularity.value,
    type: 'cumulative',
    countType: 'cumulative',
    activityType: 'message',
    repos: selectedReposValues.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data: cumulativeData,
  status: cumulativeStatus,
  error: cumulativeError,
  suspense: lineSuspense
} = useQuery<MailingListsMessages>({
  queryKey: lineQueryKey,
  queryFn: fetchLineData,
});

onServerPrefetch(async () => {
  await Promise.all([barSuspense(), lineSuspense()]);
});

const messages = computed<MailingListsMessages | undefined>(() => (model.value.activeTab === 'cumulative'
  ? cumulativeData.value as MailingListsMessages
  : data.value as MailingListsMessages));

const cumulativeMessageCount = computed<number>(() => {
  const cumulativeMessage = (cumulativeData.value as MailingListsMessages)?.data;

  return cumulativeMessage && cumulativeMessage.length > 0
    ? cumulativeMessage.at(-1)!.messages : 0;
});
const summary = computed<Summary | undefined>(() => messages.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(messages.value?.data as RawChartData[], 'startDate', [
    'messages'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New', value: 'new' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Messages',
    type: model.value.activeTab === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  lineGranularity.value
));
const barChartConfig = computed(() => getBarChartConfig(
  chartData.value,
  chartSeries.value,
  barGranularity.value
));

emit('update:benchmarkValue', {
    key: BenchmarkKeys.MailingListsMessages,
    value: cumulativeMessageCount.value
  });

watch(cumulativeStatus, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.MailingListsMessages,
    value: cumulativeMessageCount.value
  });
});

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.MAILING_LISTS_MESSAGES);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectMailingListMessages',
}
</script>
