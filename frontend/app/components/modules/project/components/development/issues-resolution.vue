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
      <div v-if="status === 'success'" class="flex flex-row justify-between items-center mb-6">
        <div class="flex flex-row gap-4 items-center">
          <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
          <lfx-delta-display :summary="summary" icon="circle-arrow-up-right" icon-type="solid" />
        </div>
        <div class="flex flex-col items-end justify-center">
          <span class="text-neutral-400 text-xs flex flex-row gap-2 items-center">
            <lfx-icon name="gauge-high" :size="16" />
            Avg. velocity
          </span>
          <span class="text-xl">{{ formatNumber(summary.avgVelocityInDays) }} days</span>
        </div>
      </div>

      <div class="w-full h-[350px] mt-5 pb-6">
        <lfx-chart v-if="status !== 'pending'" :config="lineAreaChartConfig">
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
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import type { IssuesResolution, ResolutionSummary } from './types/issues-resolution.types';
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
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = withDefaults(
  defineProps<{
    timePeriod?: string;
  }>(),
  {
    timePeriod: '90d'
  }
);

const { showToast } = useToastService();

const route = useRoute();

const {data, status, error} = useFetch(
    `/api/project/${route.params.slug}/development/issues-resolution`,
    {
      params: {
        repository: route.params.name || '',
        'time-period': props.timePeriod
      }
    }
);

const issuesResolution = computed<IssuesResolution>(() => data.value as IssuesResolution);

const summary = computed<ResolutionSummary>(() => issuesResolution.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(issuesResolution.value.data as RawChartData[], 'dateFrom', [
    'closedIssues',
    'totalIssues'
  ])
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
const configOverride = computed(() => ({
  xAxis: {
    axisLabel: {
      formatter: axisLabelFormatter('MMM dd')
    }
  },
  grid: {
    top: '8%'
  }
}));
const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  configOverride.value
));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching issues resolution: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectIssuesResolution',
}
</script>
