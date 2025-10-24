<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <template v-if="!props.snapshot">
      <lfx-tabs
        :tabs="tabs"
        :model-value="model.activeTab"
        class="!hidden sm:!flex"
        @update:model-value="model.activeTab = $event as CodeReviewEngagementMetric"
      />
      <lfx-dropdown-select
        v-model="model.activeTab"
        placement="bottom-start"
        class="block sm:hidden"
      >
        <template  #trigger="{selectedOption}">
          <lfx-dropdown-selector type="filled">
            {{selectedOption.label}}
          </lfx-dropdown-selector>
        </template>
        <lfx-dropdown-item
          v-for="tab of tabs"
          :key="tab.label"
          :value="tab.value"
          :label="tab.label"
        />
      </lfx-dropdown-select>
    </template>
    <div class="my-5">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div
          v-if="summary && !isEmpty"
          class="flex flex-wrap gap-y-3 flex-row gap-4 items-center"
        >
          <div class="text-heading-1 sm:text-data-display-1">{{ formatNumber(summary.current) }} contributors</div>
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
      error-message="Error fetching code review engagement"
      :is-empty="isEmpty"
      use-min-height
      :height="330"
    >
      <div class="w-full min-h-[330px]">
        <div class="font-semibold mb-5">
          <span class="text-black">{{ title }}</span>
        </div>

        <lfx-code-review-table
          v-if="model.activeTab === CodeReviewEngagementMetric.PR_PARTICIPANTS"
          show-percentage
          :metric="model.activeTab"
          :code-review-item="prParticipantsData"
        />
        <div
          v-else
          class="w-full h-[330px] mt-4"
        >
          <lfx-chart
            :config="barChartConfig"
            :animation="!props.snapshot"
          />
        </div>
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import type { 
  CodeReviewEngagement, 
  CodeReviewEngagementPRParticipantsItem, 
  CodeReviewEngagementCommentsItem, 
  CodeReviewEngagementReviewsItem } 
from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import {CodeReviewEngagementMetric} from "~~/types/development/requests.types";
import LfxCodeReviewTable from "~/components/modules/widget/components/development/fragments/code-review-table.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import {Widget} from "~/components/modules/widget/types/widget";
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { convertToChartData, markLastDataItem } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import type { Granularity } from '~~/types/shared/granularity';
import { barGranularities } from '~/components/shared/types/granularity';
import { DEVELOPMENT_API_SERVICE, type QueryParams } 
  from '~/components/modules/widget/services/development.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

interface CodeReviewEngagementModel extends WidgetModel {
  activeTab: string;
}

const props = defineProps<{
  modelValue?: CodeReviewEngagementModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: CodeReviewEngagementModel): void;
  (e: 'dataLoaded', value: string): void;
}>();

const model = computed<CodeReviewEngagementModel>({
  get: () => props.modelValue || { activeTab: CodeReviewEngagementMetric.PR_PARTICIPANTS },
  set: (value: CodeReviewEngagementModel) => emit('update:modelValue', value)
})

const {
 startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore());

const route = useRoute();

const params = computed<QueryParams>(() => ({
  projectSlug: route.params.slug as string,
  granularity: '', // Not needed for code review engagement
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
  metric: model.value.activeTab,
}));

const {
  data, status, error
} = DEVELOPMENT_API_SERVICE.fetchCodeReviewEngagement(params);

const codeReviewEngagement = computed<CodeReviewEngagement>(() => data.value as CodeReviewEngagement);
const prParticipantsData = computed<CodeReviewEngagementPRParticipantsItem[]>(() =>
  model.value.activeTab === CodeReviewEngagementMetric.PR_PARTICIPANTS ?
    codeReviewEngagement.value.data as CodeReviewEngagementPRParticipantsItem[] :
    []);

const reviewCommentsData = computed<CodeReviewEngagementCommentsItem[]>(() =>
  model.value.activeTab === CodeReviewEngagementMetric.REVIEW_COMMENTS ?
    codeReviewEngagement.value.data as CodeReviewEngagementCommentsItem[] :
    []);

const codeReviewsData = computed<CodeReviewEngagementReviewsItem[]>(() =>
  model.value.activeTab === CodeReviewEngagementMetric.CODE_REVIEWS ?
    codeReviewEngagement.value.data as CodeReviewEngagementReviewsItem[] :
    []);

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: model.value.activeTab === CodeReviewEngagementMetric.REVIEW_COMMENTS ? 'Review Comments' : 'Code Reviews',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const chartData = computed<ChartData[]>(() => {
  if (model.value.activeTab === CodeReviewEngagementMetric.REVIEW_COMMENTS) {
    return markLastDataItem(
      convertToChartData(
        reviewCommentsData.value as unknown as RawChartData[], 
        'startDate', 
        ['comments']
      ), barGranularity.value);
  } else if (model.value.activeTab === CodeReviewEngagementMetric.CODE_REVIEWS) {
    return markLastDataItem(
      convertToChartData(
        codeReviewsData.value as unknown as RawChartData[], 
        'startDate', 
        ['reviews']
      ), barGranularity.value);
  }
  return [];
});

const title = computed(() => {
  switch (model.value.activeTab) {
    case CodeReviewEngagementMetric.PR_PARTICIPANTS:
      return 'Top contributors';
    case CodeReviewEngagementMetric.REVIEW_COMMENTS:
      return 'Review comments on pull requests';
    default:
      return 'Code reviews on pull requests';
  }
});

const summary = computed<Summary>(() => codeReviewEngagement.value.summary);

const tabs = [
  { label: 'PR participants', value: CodeReviewEngagementMetric.PR_PARTICIPANTS },
  { label: 'Review comments', value: CodeReviewEngagementMetric.REVIEW_COMMENTS },
  { label: 'Code reviews', value: CodeReviewEngagementMetric.CODE_REVIEWS }
];

const isEmpty = computed(() => isEmptyData(
  (codeReviewEngagement.value?.data || []) as unknown as Record<string, unknown>[]
));

const barChartConfig = computed(() => getBarChartConfig(
  chartData.value,
  chartSeries.value,
  barGranularity.value
));

watch(status, (value: string) => {
  if (value !== 'pending') {
    emit('dataLoaded', Widget.CODE_REVIEW_ENGAGEMENT);
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
  name: 'LfxProjectCodeReviewEngagement',
}
</script>
