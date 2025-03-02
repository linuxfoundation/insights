<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Pull requests
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
          <span v-if="status === 'success'" class="text-xl">{{ formatNumber(pullRequests.avgVelocityInDays) }}
            days</span>
        </div>
      </div>

      <div class="w-full h-[330px] my-5">
        <lfx-chart v-if="status !== 'pending'" :config="barChartConfig" />
        <lfx-spinner v-else />
      </div>

      <div v-if="status === 'success'" class="flex flex-col gap-5">
        <lfx-project-pull-request-legend-item title="Open" :delta="openSummary!" :color="chartSeries[0]!.color!" />
        <lfx-project-pull-request-legend-item title="Merged" :delta="mergedSummary!" :color="chartSeries[1]!.color!" />
        <lfx-project-pull-request-legend-item title="Closed" :delta="closedSummary!" :color="chartSeries[2]!.color!" />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import {storeToRefs} from "pinia";
import type { PullRequests } from './types/pull-requests.types';
import LfxProjectPullRequestLegendItem from './fragments/pull-request-legend-item.vue';
import type { Summary } from '~/components/shared/types/summary.types';
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
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import {useProjectStore} from "~/components/modules/project/store/project.store";

const { showToast } = useToastService();
const {dateStart, dateEnd} = storeToRefs(useProjectStore())

const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/development/pull-requests`,
  {
    params: {
      project: route.params.slug,
      repository: route.params.name || '',
      dateStart,
      dateEnd,
    }
  }
);

const pullRequests = computed<PullRequests>(() => data.value as PullRequests);

const summary = computed<Summary>(() => pullRequests.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(pullRequests.value.data as RawChartData[], 'dateFrom', [
    'open',
    'merged',
    'closed'
  ])
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
    color: lfxColors.neutral[200]
  }
]);
const configOverride = computed(() => ({
  xAxis: {
    axisLabel: {
      formatter: axisLabelFormatter('MMM dd')
    }
  },
  grid: {
    top: '8%',
    bottom: '8%'
  }
}));
const barChartConfig = computed(() => getBarChartConfigStacked(
  chartData.value,
  chartSeries.value,
  configOverride.value
));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching social mentions: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPullRequests',
}
</script>
