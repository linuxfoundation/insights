<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Issues resolution
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
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
              <span class="text-xl">{{ formatNumber(summary.avgVelocityInDays) }} days</span>
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
        :height="350"
      >
        <div class="w-full h-[350px] mt-5 pb-6">
          <lfx-chart :config="lineAreaChartConfig">
            <template #legend>
              <div class="flex flex-row gap-5 items-center justify-center pt-2">
                <div class="flex flex-row items-center gap-2">
                  <div class="w-5 border-brand-500 border-b-2 border-solid" />
                  <span class="text-xs text-neutral-900">Closed Issues</span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <div class="w-5 border-neutral-600 border-b-2 border-dashed" />
                  <span class="text-xs text-neutral-900">Total Issues</span>
                </div>
              </div>
            </template>
          </lfx-chart>
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
import type { IssuesResolution, ResolutionSummary } from '~~/types/development/responses.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import type { Granularity } from '~~/types/shared/granularity';

const {
  startDate, endDate, selectedRepository, selectedTimeRangeKey, customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();
const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));
const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/development/issues-resolution`,
  {
    params: {
      granularity,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const issuesResolution = computed<IssuesResolution>(() => data.value as IssuesResolution);

const summary = computed<ResolutionSummary>(() => issuesResolution.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((issuesResolution.value?.data || []) as RawChartData[], 'dateFrom', [
    'closedIssues',
    'totalIssues'
  ], undefined, 'dateTo')
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Closed Issues',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500],
    lineWidth: 2
  },
  {
    name: 'Total Issues',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    lineStyle: 'dotted',
    color: lfxColors.neutral[500],
    lineWidth: 2
  }
]);

const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  granularity.value,
));
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectIssuesResolution',
}
</script>
