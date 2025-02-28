<template>
  <lfx-card class="py-6">
    <div class="px-6">
      <h3 class="text-heading-3 font-semibold font-secondary pb-3">Geographical distribution</h3>
      <p class="text-body-2 text-neutral-500 mb-6">
        Distribution of contributors based on geographical location.
      </p>
      <hr>
    </div>
    <section class="mt-5">
      <div class="px-6">
        <div class="flex flex-row gap-4 items-center mb-10">
          <div class="basis-1/2">
            <lfx-tabs
              :tabs="tabs"
              :model-value="activeTab"
              width-type="inline"
              @update:model-value="activeTab = $event" />
          </div>
          <div class="basis-1/2 flex justify-end">
            <lfx-dropdown
              v-model="metric"
              icon="fa-light fa-display-code"
              :options="metricOptions"
              full-width
              center />
          </div>
        </div>
      </div>
      <div class="w-full h-[330px] border-solid border-neutral-100 border-x-0 border-y">
        <lfx-chart
          v-if="status !== 'pending'"
          :config="getGeoMapChartConfig(chartData, chartSeries, getMaxValue(chartData))" />
        <lfx-spinner v-else />
      </div>
      <div class="px-6 mt-5">
        <div v-if="status !== 'pending'" class="flex flex-col gap-5">
          <div
            v-for="item in geoMapData"
            :key="item.name"
            class="flex flex-row justify-between items-center text-sm">
            <div class="flex flex-row gap-4 items-center">
              <span class="text-base">
                {{ item.flag }}
              </span>
              <span class="font-medium">
                {{ item.name }}
              </span>
            </div>
            <span>
              {{ formatNumber(item.count) }} {{ label.toLowerCase() }} ({{ item.percentage }}%)
            </span>
          </div>
        </div>
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useFetch } from 'nuxt/app';
import { metricsOptions } from './config/metrics';
import type { GeoMapResponse, GeoMapData } from './types/geo-map.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { convertToChartData, getMaxValue } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import { getGeoMapChartConfig } from '~/components/uikit/chart/configs/geo-map.chart';
import { formatNumber } from '~/components/shared/utils/formatter';

const props = withDefaults(
  defineProps<{
    timePeriod?: string;
  }>(),
  {
    timePeriod: '90d'
  }
);

const { showToast } = useToastService();
const metricOptions = metricsOptions;

const route = useRoute();
const metric = ref('all');
const activeTab = ref('contributors');

const {data, status, error} = useFetch(
    `/api/project/${route.params.slug}/contributors/geographical-distribution`,
    {
      params: {
        type: activeTab.value,
        repository: route.params.name || '',
        'time-period': props.timePeriod
      }
    }
);

const geoMapData = computed<GeoMapData[]>(() => (data.value as GeoMapResponse).data);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(geoMapData.value as unknown as RawChartData[], 'name', ['count'])
);

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

const label = computed(() => (activeTab.value === 'contributors' ? 'Contributors' : 'Organizations'));

const chartSeries = ref<ChartSeries[]>([
  {
    name: `${label.value} by country`,
    type: 'map',
    yAxisIndex: 0,
    dataIndex: 0
  }
]);

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching retention: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectGeographicalDistribution'
};
</script>
