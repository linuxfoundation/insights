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
      v-if="!isEmpty && !props.snapshot"
      :tabs="tabs"
      :model-value="model.activeTab"
      @update:model-value="model.activeTab = $event"
    />
    <div
      v-if="props.snapshot"
      class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
    >
      <span v-if="model.activeTab === 'new'">{{barGranularity}} new commits</span>
      <span v-else>{{lineGranularity}} commit growth</span>
    </div>
    <lfx-project-load-state
      :status="model.activeTab === 'cumulative' ? cumulativeStatus : status"
      :error="model.activeTab === 'cumulative' ? cumulativeError : error"
      error-message="Error fetching commit activities"
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
 computed, watch
} from 'vue';
import { storeToRefs } from "pinia";
import type { CommitActivities } from '~~/types/popularity/responses.types';
import { lineGranularities, barGranularities } from '~/components/shared/types/granularity';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
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
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import { DEVELOPMENT_API_SERVICE, type QueryParams } 
  from '~/components/modules/widget/services/development.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

interface CommitActivitiesModel extends WidgetModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue?: CommitActivitiesModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: CommitActivitiesModel): void;
  (e: 'dataLoaded', value: string): void;
}>();

const model = computed<CommitActivitiesModel>({
  get: () => props.modelValue || { activeTab: 'new' },
  set: (value: CommitActivitiesModel) => emit('update:modelValue', value)
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

const barParams = computed<QueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: barGranularity.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  type: 'new',
  countType: 'new',
  activityType: 'authored-commit',
}));

const lineParams = computed<QueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: lineGranularity.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  type: 'cumulative',
  countType: 'cumulative',
  activityType: 'authored-commit',
}));

const {
  data,
  status,
  error,
} = DEVELOPMENT_API_SERVICE.fetchCommitActivities(barParams);

const {
  data: cumulativeData,
  status: cumulativeStatus,
  error: cumulativeError,
} = DEVELOPMENT_API_SERVICE.fetchCommitActivities(lineParams);

const commitActivities = computed<CommitActivities | undefined>(() => (model.value.activeTab === 'cumulative'
  ? cumulativeData.value as CommitActivities
  : data.value as CommitActivities));

const summary = computed<Summary | undefined>(() => commitActivities.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    let tmpData = convertToChartData(commitActivities.value?.data as RawChartData[], 'startDate', [
      'commits'
    ], undefined, 'endDate');

    return markLastDataItem(tmpData, barGranularity.value);
  }
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New', value: 'new' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Commits',
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

watch(status, (value: string) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.COMMIT_ACTIVITIES);
  }
}, {
  immediate: true
});

watch(() => model.value.activeTab, (value: string) => {
  emit('update:modelValue', { activeTab: value });
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCommitActivities',
}
</script>
