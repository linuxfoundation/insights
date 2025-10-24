<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div :class="props.snapshot ? 'mb-5' : 'mb-6'">
      <lfx-skeleton-state
        :status="summaryLoading ? status : 'success'"
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
      v-if="!isEmpty && tabs.length > 1 && !props.snapshot"
      :tabs="tabs"
      :model-value="model.activeTab"
      @update:model-value="model.activeTab = $event as Granularity"
    />
    <div
      v-if="props.snapshot"
      class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
    >
      {{ model.activeTab }} active contributors
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching active contributors"
      :is-empty="isEmpty"
    >
      <div class="h-[330px]">
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
import type { ActiveContributors } from '~~/types/contributors/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { convertToChartData, markLastDataItem, removeZeroValues } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { isEmptyData } from '~/components/shared/utils/helper';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { granularityTabs } from '~/components/modules/widget/components/contributors/config/granularity-tabs';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { Granularity } from '~~/types/shared/granularity';
import { Widget } from '~/components/modules/widget/types/widget';
import { CONTRIBUTORS_API_SERVICE } from '~~/app/components/modules/widget/services/contributors.api.service';
import type { WidgetModel } from '~/components/modules/widget/config/widget.config';

interface ActiveContributorsModel extends WidgetModel {
  activeTab: Granularity;
}

const props = defineProps<{
  modelValue: ActiveContributorsModel;
  snapshot?: boolean;
}>();

const emit = defineEmits<{
  (e: 'dataLoaded', value: string): void;
  (e: 'update:modelValue', value: ActiveContributorsModel): void;
  (e: 'hasData', value: boolean): void;
}>();

const model = computed<ActiveContributorsModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { startDate, endDate, selectedTimeRangeKey, customRangeGranularity, selectedReposValues } =
  storeToRefs(useProjectStore());

const route = useRoute();

const summaryLoading = ref(true);

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  granularity: model.value.activeTab,
  startDate: startDate.value,
  endDate: endDate.value,
  repos: selectedReposValues.value,
  includeCollaborations: model.value.includeCollaborations,
}));

const { data, status, error } = CONTRIBUTORS_API_SERVICE.fetchActiveContributors(params);

const activeContributors = computed<ActiveContributors>(() => data.value as ActiveContributors);

const summary = computed<Summary>(() => activeContributors.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    let tmpData = convertToChartData(
      activeContributors.value?.data as RawChartData[],
      'startDate',
      ['contributors'],
      undefined,
      'endDate',
    );
    tmpData = selectedTimeRangeKey.value === dateOptKeys.alltime ? removeZeroValues(tmpData) : tmpData;

    return markLastDataItem(tmpData, model.value.activeTab);
  },
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = computed(() =>
  granularityTabs.filter((tab) => {
    if (selectedTimeRangeKey.value === dateOptKeys.custom) {
      return customRangeGranularity.value.includes(tab.value);
    }

    return tab.showForKeys.includes(selectedTimeRangeKey.value);
  }),
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributors',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
  },
]);

const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value, model.value.activeTab));

watch(
  tabs,
  () => {
    if (!tabs.value.some((tab) => tab.value === model.value.activeTab)) {
      model.value.activeTab = (tabs.value[0]?.value || Granularity.WEEKLY) as Granularity;
    }
  },
  {
    immediate: true,
  },
);

watch(selectedTimeRangeKey, () => {
  model.value.activeTab = (tabs.value[0]?.value || Granularity.WEEKLY) as Granularity;
});

watch(params, (newParams, oldParams) => {
  let onlyGranularityChanged = newParams.granularity !== oldParams.granularity;
  // check if the only change was the granularity, if not, we need to reset the summary loading
  if (
    newParams.startDate !== oldParams.startDate ||
    newParams.endDate !== oldParams.endDate ||
    newParams.repos !== oldParams.repos
  ) {
    onlyGranularityChanged = false;
  }

  summaryLoading.value = !onlyGranularityChanged;
});

watch(
  status,
  (value) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.ACTIVE_CONTRIBUTORS);
    }
  },
  {
    immediate: true,
  },
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
  name: 'LfxProjectActiveContributors',
};
</script>
