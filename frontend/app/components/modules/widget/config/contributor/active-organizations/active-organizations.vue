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
        <div class="flex flex-row gap-4 items-center">
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
      {{model.activeTab}} active organizations
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching active organizations"
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
import {useRoute} from 'nuxt/app';
import {
computed, onServerPrefetch, ref, watch
} from 'vue';
import {storeToRefs} from "pinia";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import type { ActiveOrganizations } from '~~/types/contributors/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import {convertToChartData} from '~/components/uikit/chart/helpers/chart-helpers';
import type {ChartData, ChartSeries, RawChartData} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import {getBarChartConfig} from '~/components/uikit/chart/configs/bar.chart';
import {lfxColors} from '~/config/styles/colors';
import {formatNumber} from '~/components/shared/utils/formatter';
import {useProjectStore} from "~/components/modules/project/store/project.store";
import {isEmptyData} from '~/components/shared/utils/helper';
import {dateOptKeys} from '~/components/modules/project/config/date-options';
import {TanstackKey} from "~/components/shared/types/tanstack";
import {granularityTabs} from "~/components/modules/widget/components/contributors/config/granularity-tabs";
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import {Granularity} from "~~/types/shared/granularity";

interface ActiveOrganizationsModel {
  activeTab: Granularity;
}

const props = defineProps<{
  modelValue: ActiveOrganizationsModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: ActiveOrganizationsModel): void}>();

const model = computed<ActiveOrganizationsModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();
// just a stub var to watch if the only change was the granularity
const paramWatch = computed(() => ({
  granularity: model.value.activeTab,
  repository: selectedRepository.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));
const summaryLoading = ref(true);

const queryKey = computed(() => [
  TanstackKey.ACTIVE_ORGANIZATIONS,
  route.params.slug,
  model.value.activeTab,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<ActiveOrganizations> = async () => $fetch(
    `/api/project/${route.params.slug}/contributors/active-organizations`,
    {
  params: {
    granularity: model.value.activeTab,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {
data, status, error, suspense
} = useQuery<ActiveOrganizations>({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
})

const activeOrganizations = computed<ActiveOrganizations>(() => data.value as ActiveOrganizations);

const summary = computed<Summary>(() => activeOrganizations.value.summary);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((activeOrganizations.value?.data || []) as RawChartData[], 'startDate', [
    'organizations'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = computed(() => granularityTabs.filter((tab) => {
  if (selectedTimeRangeKey.value === dateOptKeys.custom) {
    return customRangeGranularity.value.includes(tab.value);
  }

  return tab.showForKeys.includes(selectedTimeRangeKey.value)
}));

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Organizations',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value, model.value.activeTab));

watch(selectedTimeRangeKey, () => {
  model.value.activeTab = (tabs.value[0]?.value || Granularity.WEEKLY) as Granularity;
});

watch(paramWatch, (newParams, oldParams) => {
  let onlyGranularityChanged = newParams.granularity !== oldParams.granularity;
  // check if the only change was the granularity, if not, we need to reset the summary loading
  if (newParams.startDate !== oldParams.startDate
    || newParams.endDate !== oldParams.endDate
    || newParams.repository !== oldParams.repository) {
    onlyGranularityChanged = false;
  }

  summaryLoading.value = !onlyGranularityChanged;
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectActiveOrganizations'
};
</script>
