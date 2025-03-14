<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Pull requests
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Comparison between opened and merged (or closed) pull requests during the selected period.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <div class="flex flex-row justify-between items-center">
          <lfx-skeleton-state
            :status="status"
            height="2rem"
            width="7.5rem"
          >
            <div class="flex flex-row gap-4 items-center">
              <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
              <lfx-delta-display
                :summary="summary"
                icon="circle-arrow-up-right"
                icon-type="solid"
              />
            </div>
          </lfx-skeleton-state>

          <div
            v-if="!isEmpty"
            class="flex flex-col items-end justify-center"
          >
            <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
              <lfx-icon
                name="gauge-high"
                :size="16"
              />
              Avg. velocity
            </span>
            <lfx-skeleton-state
              :status="status"
              height="1.25rem"
              width="4rem"
            >
              <span class="text-xl">{{ formatNumber(pullRequests.avgVelocityInDays) }} days</span>
            </lfx-skeleton-state>
          </div>
        </div>
      </div>

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching forks"
        :is-empty="isEmpty"
        use-min-height
      >
        <div class="w-full h-[330px] my-5">
          <lfx-chart :config="barChartConfig" />
        </div>

        <div class="flex flex-col gap-5">
          <lfx-project-pull-request-legend-item
            title="Open"
            :delta="openSummary!"
            :color="chartSeries[0]!.color!"
          />
          <lfx-project-pull-request-legend-item
            title="Merged"
            :delta="mergedSummary!"
            :color="chartSeries[1]!.color!"
          />
          <lfx-project-pull-request-legend-item
            title="Closed"
            :delta="closedSummary!"
            :color="chartSeries[2]!.color!"
          />
        </div>
      </lfx-project-load-state>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxSkeletonState from '../shared/skeleton-state.vue';
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxProjectPullRequestLegendItem from './fragments/pull-request-legend-item.vue';
import type { PullRequests } from '~~/types/development/responses.types';
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
import { getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import LfxIcon from "~/components/uikit/icon/icon.vue";
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
  () => `/api/project/${route.params.slug}/development/pull-requests`,
  {
    params: {
      granularity,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const pullRequests = computed<PullRequests>(() => data.value as PullRequests);

const summary = computed<Summary>(() => pullRequests.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((pullRequests.value?.data || []) as RawChartData[], 'dateFrom', [
    'open',
    'merged',
    'closed'
  ], undefined, 'dateTo')
);

const openSummary = computed<Summary | undefined>(() => pullRequests.value?.openSummary);
const mergedSummary = computed<Summary | undefined>(() => pullRequests.value?.mergedSummary);
const closedSummary = computed<Summary | undefined>(() => pullRequests.value?.closedSummary);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Open',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  },
  {
    name: 'Merged',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.warning[500]
  },
  {
    name: 'Closed',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.negative[500]
  }
]);

const barChartConfig = computed(() => getBarChartConfigStacked(
  chartData.value,
  chartSeries.value,
  granularity.value,
));

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPullRequests',
}
</script>
