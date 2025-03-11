<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Contributions outside work hours
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div class="flex flex-row justify-between items-center mb-6 gap-8">
        <lfx-skeleton-state
          :status="status"
          height="2rem"
          width="7.5rem"
        >
          <div class="flex flex-row gap-4 items-center grow">
            <div class="text-data-display-1">{{ formatNumber(summary.current) }}%</div>
            <lfx-delta-display
              :summary="summary"
              icon="circle-arrow-up-right"
              icon-type="solid"
              percentage-only
              unit="%"
            />
          </div>
        </lfx-skeleton-state>

        <div class="flex flex-col items-end justify-center">
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            Mon-Fri (after 18:00)
          </span>
          <lfx-skeleton-state
            :status="status"
            height="1.25rem"
            width="4rem"
          >
            <span
              v-if="status === 'success'"
              class="text-xl"
            >
              {{ formatNumber(weekdayPercentage, 1) }}%
            </span>
          </lfx-skeleton-state>
        </div>
        <div class="flex flex-col items-end justify-center">
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            Weekends
          </span>
          <lfx-skeleton-state
            :status="status"
            height="1.25rem"
            width="4rem"
          >
            <span
              v-if="status === 'success'"
              class="text-xl"
            >
              {{ formatNumber(weekendPercentage, 1) }}%
            </span>
          </lfx-skeleton-state>
        </div>
      </div>

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching forks"
        :is-empty="isEmpty"
        use-min-height
        :height="430"
      >
        <div class="w-full h-[430px] my-5">
          <lfx-chart :config="getScatterChartConfig(chartData, chartSeries)" />
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
import type { ContributionOutsideHours } from './types/contribution-outside-hours.types';
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
import { lfxColors } from '~/config/styles/colors';
import { getScatterChartConfig } from '~/components/uikit/chart/configs/scatter.chart';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/development/contribution-outside`,
  {
    params: {
      project: route.params.slug,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);
const contributionOutsideHours = computed<ContributionOutsideHours>(() => data.value as ContributionOutsideHours);
const summary = computed<Summary>(() => contributionOutsideHours.value.summary);
const weekdayPercentage = computed<number>(() => contributionOutsideHours.value.weekdayOutsideHoursPercentage);
const weekendPercentage = computed<number>(() => contributionOutsideHours.value.weekendOutsideHoursPercentage);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(
    (contributionOutsideHours.value?.data || []) as RawChartData[],
    'day',
    ['contributions'],
    'hour'
  )
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributions',
    type: 'scatter',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

</script>

<script lang="ts">
export default {
  name: 'LfxProjectContributionsOutsideWorkHours',
}
</script>
