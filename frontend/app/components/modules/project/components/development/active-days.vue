<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Active days
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
            Avg. contributions per day
          </span>
          <span v-if="status === 'success'" class="text-xl">
            {{ formatNumber(activeDays.avgContributions) }}
          </span>
        </div>
      </div>

      <div class="mt-8 mb-6 text-neutral-900 font-medium">Contributions per day</div>
      <div class="w-full h-[100px] mb-5">
        <lfx-chart v-if="status !== 'pending'" :config="getHeatMapChartConfig(chartData, chartSeries, categoryData)" />
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import type { ActiveDays } from './types/active-days.types';
import type { Summary } from '~/components/shared/types/summary.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData, convertToCategoryData } from '~/components/uikit/chart/helpers/chart-helpers';
import type {
  ChartData,
  RawChartData,
  ChartSeries,
  CategoryData
} from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getHeatMapChartConfig } from '~/components/uikit/chart/configs/heat-map.chart';
import { lfxColors } from '~/config/styles/colors';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumber } from '~/components/shared/utils/formatter';

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
  () => `/api/project/${route.params.slug}/development/active-days`,
  {
    params: {
      project: route.params.slug,
      repository: route.params.name || '',
      'time-period': props.timePeriod
    }
  }
);

const activeDays = computed<ActiveDays>(() => data.value as ActiveDays);

const summary = computed<Summary>(() => activeDays.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(activeDays.value.data as RawChartData[], 'day', [
    'contributions'
  ])
);
const categoryData = computed<CategoryData>(() => convertToCategoryData(chartData.value, [{ key: '0', values: [0] }]));

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Contributions',
    type: 'heatmap',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[700]
  }
]);

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
  name: 'LfxProjectActiveDays',
}
</script>
