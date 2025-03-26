<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Geographical distribution</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Distribution of contributors and organizations based on geographical location at the time of their contributions
      during the selected period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
      <div class="flex flex-wrap md:flex-nowrap flex-row justify-between gap-4 items-center mb-10">
        <lfx-tabs
          :tabs="tabs"
          :model-value="activeTab"
          width-type="inline"
          @update:model-value="activeTab = $event"
        />
        <div class="max-w-max">
          <lfx-metric-dropdown
            v-model="metric"
            placement="bottom-end"
            :full-width="false"
            :match-width="false"
            width="25rem"
          />
        </div>
      </div>
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching geographical distribution"
        :is-empty="isEmpty"
      >
        <div class="w-full h-[330px]">
          <lfx-chart :config="getGeoMapChartConfig(chartData, chartSeries, getMaxValue(chartData))" />
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
  </lfx-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useFetch } from 'nuxt/app';
import { storeToRefs } from "pinia";
import pluralize from "pluralize";
import LfxProjectLoadState from '../shared/load-state.vue';
import type { GeoMapResponse, GeoMapData } from './types/geo-map.types';
import LfxMetricDropdown from './fragments/metric-dropdown.vue';
import LfxCard from '~/components/uikit/card/card.vue';
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
import { links } from '~/config/links';

const route = useRoute();
const metric = ref('all:all');
const activeTab = ref('contributors');
const platform = computed(() => metric.value.split(':')[0]);
const activityType = computed(() => metric.value.split(':')[1]);
const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/geographical-distribution`,
  {
    params: {
      type: activeTab,
      platform,
      activityType,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const geoMapData = computed<GeoMapData[] | undefined>(() => (data.value as GeoMapResponse)?.data);
const geoMapDataCountries = computed<GeoMapData[] | undefined>(() => (geoMapData.value
  ? geoMapData.value.filter((item) => item.name !== 'Unknown').slice(0, 5) : undefined));
const unknownGeoMapData = computed<GeoMapData[] | undefined>(() => (geoMapData.value
  ? geoMapData.value.filter((item) => item.name === 'Unknown') : undefined));

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(geoMapData.value as unknown as RawChartData[], 'name', ['count'])
);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

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

const label = computed(() => (activeTab.value === 'contributors' ? 'Contributor' : 'Organization'));

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
