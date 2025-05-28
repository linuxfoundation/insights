<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section :class="props.snapshot ? 'mt-2' : 'mt-5'">
    <div
      class="flex flex-wrap md:flex-nowrap flex-row justify-between gap-4 items-center"
      :class="props.snapshot ? 'mb-5' : 'mb-10'"
    >
      <lfx-tabs
        v-if="!props.snapshot"
        :tabs="tabs"
        :model-value="model.activeTab"
        width-type="inline"
        @update:model-value="model.activeTab = $event"
      />
      <div class="max-w-max">
        <lfx-activities-dropdown
          v-model="model.metric"
          placement="bottom-end"
          :full-width="false"
          :match-width="false"
          width="25rem"
          :snapshot="props.snapshot"
        />
      </div>
    </div>
    <div v-if="props.snapshot">
      <div class="text-sm leading-4 font-semibold first-letter:uppercase pb-5">
        {{model.activeTab}} distribution
      </div>
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching geographical distribution"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[330px]">
        <lfx-chart
          :config="getGeoMapChartConfig(chartData, chartSeries, getMaxValue(chartData))"
          :animation="!props.snapshot"
        />
      </div>
      <div>
        <div
          v-if="status !== 'pending'"
          class="flex flex-col gap-5"
        >
          <div
            v-for="item in geoMapDataCountries"
            :key="item.name"
            class="flex flex-row justify-between items-center text-sm"
          >
            <div class="flex flex-row gap-4 items-center">
              <span class="text-base">
                {{ item.flag }}
              </span>
              <span class="font-medium">
                {{ item.name }}
              </span>
            </div>
            <span>
              {{ formatNumber(item.count) }} {{ pluralize(label.toLowerCase(), item.count) }} ・ {{ item.percentage }}%
            </span>
          </div>
        </div>
        <div
          v-if="status !== 'pending'"
          class="flex flex-col gap-5"
        >
          <div
            v-for="item in unknownGeoMapData"
            :key="item.name"
            class="flex flex-row justify-between items-center text-sm border-neutral-100 border-t pt-5 mt-5"
          >
            <span class="text-neutral-500 font-medium">
              Unknown location
            </span>
            <span class="text-neutral-500 font-medium">
              {{ formatNumber(item.count) }} {{ pluralize(label.toLowerCase(), item.count) }} ・ {{ item.percentage }}%
            </span>
          </div>
        </div>
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import {
computed, onServerPrefetch
} from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from "pinia";
import pluralize from "pluralize";
import {useQuery} from "@tanstack/vue-query";
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { convertToChartData, getMaxValue } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import { getGeoMapChartConfig } from '~/components/uikit/chart/configs/geo-map.chart';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import {TanstackKey} from "~/components/shared/types/tanstack";
import type {GeoMapData, GeoMapResponse }
  from "~/components/modules/widget/components/contributors/types/geo-map.types";
import LfxActivitiesDropdown
  from "~/components/modules/widget/components/contributors/fragments/activities-dropdown.vue";
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";

interface GeographicalDistributionModel {
  metric: string;
  activeTab: string;
}

const props = defineProps<{
  modelValue: GeographicalDistributionModel,
  snapshot?: boolean
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: GeographicalDistributionModel): void}>();

const model = computed<GeographicalDistributionModel>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const route = useRoute();
const platform = computed(() => model.value.metric.split(':')[0]);
const activityType = computed(() => model.value.metric.split(':')[1]);
const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const queryKey = computed(() => [
  TanstackKey.GEOGRAPHICAL_DISTRIBUTION,
  route.params.slug,
  model.value.activeTab,
  platform.value,
  activityType.value,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData = async () => $fetch(`/api/project/${route.params.slug}/contributors/geographical-distribution`, {
  params: {
    type: model.value.activeTab,
    platform: platform.value,
    activityType: activityType.value,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
});

const {
data, status, error, suspense
} = useQuery({
  queryKey,
  queryFn: fetchData,
});

onServerPrefetch(async () => {
  await suspense()
})

const geoMapData = computed<GeoMapData[] | undefined>(() => (data.value as GeoMapResponse)?.data);
const geoMapDataCountries = computed<GeoMapData[] | undefined>(() => (geoMapData.value
  ? geoMapData.value.filter((item) => item.name !== 'Unknown').slice(0, 5) : undefined));
const unknownGeoMapData = computed<GeoMapData[] | undefined>(() => (geoMapData.value
  ? geoMapData.value.filter((item) => item.name === 'Unknown') : undefined));

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(geoMapData.value as unknown as RawChartData[], 'name', ['count', 'percentage'])
  .map((item) => ({
    ...item,
    key: item.key === 'United States' ? 'United States of America' : item.key
  }))
);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  {
    label: 'Organizations',
    value: 'organizations'
  },
  {
    label: 'Contributors',
    value: 'contributors'
  }
];

const label = computed(() => (model.value.activeTab === 'contributors' ? 'Contributor' : 'Organization'));

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: label.value,
    type: 'map',
    yAxisIndex: 0,
    dataIndex: 0
  }
]);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectGeographicalDistribution'
};
</script>
