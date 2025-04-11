<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Wait time for 1st review
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Average time taken between pull request submission and its first review during the selected period.
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
          :status="status"
          height="2rem"
          width="7.5rem"
        >
          <div class="flex flex-row gap-4 items-center">
            <div class="text-data-display-1">{{ formatNumberToDuration(summary.current) }}</div>
            <lfx-delta-display
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
              icon="circle-arrow-up-right"
              icon-type="solid"
              is-duration
            />
          </div>
        </lfx-skeleton-state>
      </div>

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching wait time for 1st review"
        :is-empty="isEmpty"
        use-min-height
        :height="330"
      >
        <div class="w-full h-[330px]">
          <lfx-chart :config="barChartConfig" />
        </div>
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import type { WaitTime1stReview } from '~~/types/development/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getBarChartConfigCustom } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumberToDuration } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { barGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';
import { links } from '~/config/links';

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/development/wait-time-1st-review`,
  {
    params: {
      granularity,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const waitTime1stReview = computed<WaitTime1stReview>(() => data.value as WaitTime1stReview);

const summary = computed<Summary>(() => waitTime1stReview.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((waitTime1stReview.value?.data || []) as RawChartData[], 'startDate', [
    'waitTime'
  ], undefined, 'endDate')
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Wait time for 1st review',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const configOverride = computed(() => ({
  yAxis: {
    axisLabel: {
      formatter: (value: number) => `${value === 0 ? '' : `${value}h`}`
    },
    max: (value: { min: number; max: number }) => Math.ceil(value.max / 20) * 20 + 20,

  }
}));

const barChartConfig = computed(() => getBarChartConfigCustom(
  chartData.value,
  chartSeries.value,
  {},
  granularity.value,
  configOverride.value
));
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForksWaitTimeFirstReview',
}
</script>
