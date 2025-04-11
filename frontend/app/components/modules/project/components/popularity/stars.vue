<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Stars
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      New stars added to the project repositories during the selected time period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <lfx-skeleton-state
          :status="activeTab === 'cumulative' ? cumulativeStatus : status"
          height="2rem"
          width="7.5rem"
        >
          <div
            v-if="summary"
            class="flex flex-row gap-4 items-center"
          >
            <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
            <lfx-delta-display
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
              icon="circle-arrow-up-right"
              icon-type="solid"
            />
          </div>
        </lfx-skeleton-state>
      </div>

      <lfx-tabs
        v-if="!isEmpty"
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <lfx-project-load-state
        :status="activeTab === 'cumulative' ? cumulativeStatus : status"
        :error="activeTab === 'cumulative' ? cumulativeError : error"
        error-message="Error fetching stars"
        :is-empty="isEmpty"
      >
        <div class="w-full h-[330px] mt-4">
          <lfx-chart :config="activeTab === 'cumulative' ? lineChartConfig : barChartConfig" />
        </div>
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import type { StarsData } from '~~/types/popularity/responses.types';
import { lineGranularities, barGranularities } from '~/components/shared/types/granularity';
import type { Summary } from '~~/types/shared/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
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
import { links } from '~/config/links';
import { BenchmarkKeys, type Benchmark } from '~~/types/shared/benchmark.types';

const emit = defineEmits<{(e: 'update:benchmarkValue', value: Benchmark): void;
}>();

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const activeTab = ref('new');
const route = useRoute();

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const lineGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/popularity/stars`,
  {
    params: {
      granularity: barGranularity,
      type: 'new',
      countType: 'new',
      activityType: 'star',
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

// cumulative data - Fetching this right away to use it for the benchmark
const { data: cumulativeData, status: cumulativeStatus, error: cumulativeError } = useFetch(
  `/api/project/${route.params.slug}/popularity/stars`,
  {
    params: {
      granularity: lineGranularity,
      type: 'cumulative',
      countType: 'cumulative',
      activityType: 'star',
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const stars = computed<StarsData | undefined>(() => (activeTab.value === 'cumulative'
  ? cumulativeData.value as StarsData
  : data.value as StarsData));
const cumulativeStarsCount = computed<number>(() => {
  const cumulativeStars = (cumulativeData.value as StarsData)?.data;

  return cumulativeStars && cumulativeStars.length > 0
    ? cumulativeStars[cumulativeStars.length - 1]!.stars : 0;
});

const summary = computed<Summary | undefined>(() => stars.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(stars.value?.data as RawChartData[], 'startDate', [
    'stars'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New', value: 'new' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Stars',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
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

emit('update:benchmarkValue', {
    key: BenchmarkKeys.Stars,
    value: cumulativeStarsCount.value
  });

watch(cumulativeStatus, () => {
  emit('update:benchmarkValue', {
    key: BenchmarkKeys.Stars,
    value: cumulativeStarsCount.value
  });
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectStars',
}
</script>
