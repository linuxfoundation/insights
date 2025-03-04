<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Retention</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Rate at which contributors join and remain active participants of the project.
    </p>
    <hr>
    <section class="mt-5">
      <div class="flex flex-row gap-4 items-center mb-10">
        <div class="basis-1/2">
          <lfx-tabs
            :tabs="tabs"
            :model-value="activeTab"
            width-type="inline"
            @update:model-value="activeTab = $event"
          />
        </div>
        <div class="basis-1/2 flex justify-end">
          <lfx-tabs
            :tabs="chartTypes"
            :model-value="chartType"
            width-type="inline"
            @update:model-value="chartType = $event"
          />
        </div>
      </div>
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching retention"
        :is-empty="isEmpty"
        :height="330"
        use-min-height
      >
        <div class="w-full h-[330px]">
          <lfx-chart :config="lineAreaChartConfig" />
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
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const { startDate, endDate } = storeToRefs(useProjectStore())

const route = useRoute();

const activeTab = ref('contributors');
const chartType = ref('line');

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/retention`,
  {
    params: {
      type: activeTab.value,
      repository: route.params.name || '',
      startDate,
      endDate,
    }
  }
);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(data.value as RawChartData[], 'dateFrom', ['percentage'])
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

const chartTypes = [
  {
    icon: 'fa-light fa-chart-line-down',
    label: 'Line',
    value: 'line'
  },
  {
    icon: 'fa-light fa-bars-sort',
    label: 'Bar',
    value: 'bar'
  }
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Percentage',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const configOverride = computed(() => ({
  xAxis: {
    axisLabel: {
      formatter: axisLabelFormatter('MMM dd')
    }
  },
  yAxis: {
    axisLabel: {
      formatter: (value: number) => `${value === 0 ? '' : `${value}%`}`
    }
  }
}));
const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value, //
  chartSeries.value, //
  configOverride.value
));

</script>

<script lang="ts">
export default {
  name: 'LfxProjectRetention'
};
</script>
