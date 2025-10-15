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
      <span v-if="model.activeTab === 'new-mentions'">{{barGranularity}} new mentions by platform</span>
      <span v-else>{{lineGranularity}} mentions by platform growth</span>
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
        >
          <template #legend>
            <div class="flex flex-row gap-5 items-center justify-center pt-2">
              <div class="flex flex-row items-center gap-2">
                <div class="w-3 h-3 bg-brand-500 rounded-xs" />
                <span class="text-xs text-neutral-900">X/Twitter</span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <div class="w-3 h-3 bg-negative-500 rounded-xs" />
                <span class="text-xs text-neutral-900">Reddit</span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <div class="w-3 h-3 bg-warning-500 rounded-xs" />
                <span class="text-xs text-neutral-900">Hacker News</span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <div class="w-3 h-3 bg-yellow rounded-xs" />
                <span class="text-xs text-neutral-900">Stack Overflow</span>
              </div>
            </div>
          </template>
        </lfx-chart>
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { SocialMentions } from '~~/types/popularity/responses.types';
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
import { getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import type { Granularity } from '~~/types/shared/granularity';
import { barGranularities, lineGranularities } from '~/components/shared/types/granularity';
import {TanstackKey} from "~/components/shared/types/tanstack";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";

interface PackageDownloadsModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue: PackageDownloadsModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'dataLoaded', value: string): void;
(e: 'update:modelValue', value: PackageDownloadsModel): void;
}>();

const model = computed<PackageDownloadsModel>({
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
  TanstackKey.SOCIAL_MENTIONS,
  route.params.slug,
  granularity.value,
  model.value.activeTab,
  selectedReposValues.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<SocialMentions> = async () => $fetch(
    `/api/project/${route.params.slug}/popularity/social-mentions`,
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
} = useQuery<SocialMentions>({
  queryKey,
  queryFn: fetchData,
});

const socialMentions = computed<SocialMentions>(() => data.value as SocialMentions);

const summary = computed<Summary>(() => socialMentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((socialMentions.value?.data || []) as RawChartData[], 'startDate', [
    'twitter',
    'reddit',
    'hackerNews',
    'stackOverflow'
  ], undefined, 'endDate')
);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New mentions by platform', value: 'new-mentions' },
  { label: 'Mentions by platform', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Twitter',
    type: model.value.activeTab === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  },
  {
    name: 'Reddit',
    type: model.value.activeTab === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.negative[500]
  },
  {
    name: 'Hacker News',
    type: model.value.activeTab === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.warning[500]
  },
  {
    name: 'Stack Overflow',
    type: model.value.activeTab === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 3,
    position: 'left',
    color: lfxColors.warning[200]
  }
]);
const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  lineGranularity.value
));
const barChartConfig = computed(() => getBarChartConfigStacked(
  chartData.value,
  chartSeries.value,
  barGranularity.value
));

watch(status, (value) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.ACTIVE_CONTRIBUTORS);
  }
}, {
  immediate: true
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSocialMentions',
}
</script>
