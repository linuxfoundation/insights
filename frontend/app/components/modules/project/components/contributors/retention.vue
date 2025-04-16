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
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from "pinia";
import { DateTime } from 'luxon';
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
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
import type { Retention } from '~~/types/contributors/responses.types';
import { Granularity } from '~~/types/shared/granularity';
import { links } from '~/config/links';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';
import {TanstackKey} from "~/components/shared/types/tanstack";

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark, activeTab: string): void;
}>();

const {
  startDate, endDate, selectedRepository
} = storeToRefs(useProjectStore())

const route = useRoute();

const activeTab = ref('contributors');
// This is a special case for the retention chart
const calculateGranularity = (start: string | null, end: string | null): string[] => {
  // Return weekly if either date is null
  if (!start || !end) {
    return [Granularity.WEEKLY];
  }

  const startDate = DateTime.fromISO(start);
  const endDate = DateTime.fromISO(end);
  const diffInDays = Math.ceil(endDate.diff(startDate, 'days').days);

  switch (true) {
    case diffInDays <= 13:
      return [Granularity.DAILY];
    case diffInDays <= 90:
      return [Granularity.WEEKLY];
    case diffInDays <= 365:
      return [Granularity.MONTHLY];
    case diffInDays <= 730:
      return [Granularity.YEARLY];
    default:
      return [Granularity.YEARLY];
  }
};
const isSingleDay = computed(() => {
  const start = DateTime.fromISO(startDate.value || '');
  const end = DateTime.fromISO(endDate.value || '');
  return start.hasSame(end, 'day');
});

const customGranularity = computed(() => calculateGranularity(startDate.value, endDate.value));

const granularity = computed(() => customGranularity.value[0] as Granularity);
// (selectedTimeRangeKey.value === dateOptKeys.custom
//   ? customGranularity.value[0] as Granularity
//   : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));
const queryKey = computed(() => [
  TanstackKey.RETENTION,
  route.params.slug,
  granularity.value,
  activeTab.value,
  selectedRepository.value,
  startDate.value,
  endDate.value,
]);

const fetchData: QueryFunction<Retention[]> = async () => $fetch(
    `/api/project/${route.params.slug}/contributors/retention`,
    {
  params: {
    granularity: granularity.value,
    type: activeTab.value,
    repository: selectedRepository.value,
    startDate: startDate.value,
    endDate: endDate.value,
  }
}
);

const {data, status, error} = useQuery<Retention[]>({
  queryKey,
  queryFn: fetchData,
});

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
const retentionValue = computed(() => (chartData.value && chartData.value.length > 0
  ? chartData.value[chartData.value.length - 1]?.values[0] : 0));

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[])
  || isSingleDay.value);

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

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Retention',
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

emit('update:benchmarkValue', {
    key: BenchmarkKeys.Retention,
    value: retentionValue.value || 0
  }, activeTab.value);

watch(chartData, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.Retention,
    value: retentionValue.value || 0
  }, activeTab.value);
});

</script>

<script lang="ts">
export default {
  name: 'LfxProjectRetention'
};
</script>
