<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Average time to merge
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div v-if="status === 'success'" class="flex flex-row gap-4 items-center mb-6">
        <div class="text-data-display-1">{{ formatNumberToDuration(summary.current) }}</div>
        <lfx-delta-display :summary="summary" icon="circle-arrow-up-right" icon-type="solid" is-duration />
      </div>

      <div class="w-full h-[330px]">
        <lfx-chart v-if="status !== 'pending'" :config="barChartConfig" />
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import type { AverageTimeMerge } from './types/average-time-merge.types';
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
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumberToDuration } from '~/components/shared/utils/formatter';

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

const { data, status, error } = useFetch(
  () => `/api/projects/development/average-time-merge?project=${route.params.slug
    }&repository=${route.params.name || ''}&time-period=${props.timePeriod}`
);

const averageTimeMerge = computed<AverageTimeMerge>(() => data.value as AverageTimeMerge);

const summary = computed<Summary>(() => averageTimeMerge.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(averageTimeMerge.value.data as RawChartData[], 'dateFrom', [
    'averageTime'
  ])
);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Average time to merge',
    type: 'bar',
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
      formatter: (value: number) => `${value === 0 ? '' : `${value}h`}`
    },
    max: (value: { min: number; max: number }) => Math.ceil(value.max / 20) * 20 + 20,

  }
}));

const barChartConfig = computed(() => getBarChartConfig(chartData.value, chartSeries.value, configOverride.value));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching average time to merge: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAverageTimeToMerge',
}
</script>
