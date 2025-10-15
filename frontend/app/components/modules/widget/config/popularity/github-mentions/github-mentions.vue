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

    <lfx-tabs
      v-if="!props.snapshot"
      :tabs="tabs"
      :model-value="model.activeTab"
      @update:model-value="model.activeTab = $event"
    />
    <div
      v-else
      class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
    >
      <span v-if="model.activeTab === 'new-mentions'">{{barGranularity}} new mentions</span>
      <span v-else>{{lineGranularity}} mentions growth</span>
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching social mentions"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px] mt-5">
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
import { computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { GithubMentions } from '~~/types/popularity/responses.types';
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
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { barGranularities, lineGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface GithubMentionsModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue: GithubMentionsModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: GithubMentionsModel): void;}>();

const model = computed<GithubMentionsModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  startDate,
  endDate,
  selectedReposValues,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const lineGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));
const granularity = computed(() => (model.value.activeTab === 'cumulative'
  ? lineGranularity.value
  : barGranularity.value));

const queryKey = computed(() => [
  TanstackKey.GITHUB_MENTIONS,
  route.params.slug,
  granularity.value,
  model.value.activeTab,
  selectedReposValues.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<GithubMentions> = async () => $fetch(
    `/api/project/${route.params.slug}/popularity/github-mentions`,
    {
  params: {
    granularity: granularity.value,
    type: model.value.activeTab,
    repos: selectedReposValues.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
  data, status, error
} = useQuery<GithubMentions>({
  queryKey,
  queryFn: fetchData,
});

const mentions = computed<GithubMentions>(() => data.value as GithubMentions);

const summary = computed<Summary>(() => mentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((mentions.value?.data || []) as RawChartData[], 'startDate', [
    'mentions'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New Mentions', value: 'new-mentions' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Github Mentions',
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

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.GITHUB_MENTIONS);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectGithubMentions',
}
</script>
