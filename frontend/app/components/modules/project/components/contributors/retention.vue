<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">Retention</h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Rate at which contributors and organizations continued contributing to the project during the selected period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
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
          <!-- TODO: Hiding for now since the final design is not decided yet -->
          <!-- <lfx-tabs :tabs="chartTypes" :model-value="chartType" width-type="inline"
            @update:model-value="chartType = $event" /> -->
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
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import type { Retention } from '~~/types/contributors/responses.types';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';
import { links } from '~/config/links';

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const activeTab = ref('contributors');
// const chartType = ref('line');

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/contributors/retention`,
  {
    params: {
      granularity,
      type: activeTab,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const retention = computed<Retention[]>(() => data.value as Retention[]);

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(
    retention.value as unknown as RawChartData[],
    'startDate',
    ['percentage'],
    undefined,
    'endDate'
  )
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

// const chartTypes = [
//   {
//     icon: 'fa-light fa-chart-line-down',
//     label: 'Line',
//     value: 'line'
//   },
//   {
//     icon: 'fa-light fa-bars-sort',
//     label: 'Bar',
//     value: 'bar'
//   }
// ];

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

const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value, //
  chartSeries.value, //
  granularity.value,
  (value: number) => `${value === 0 ? '' : `${value}%`}`
));

</script>

<script lang="ts">
export default {
  name: 'LfxProjectRetention'
};
</script>
