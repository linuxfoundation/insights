<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Stars
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <div
          v-if="status === 'success' && summary && !isEmpty"
          class="flex flex-row gap-4 items-center"
        >
          <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
          <lfx-delta-display
            :summary="summary"
            icon="circle-arrow-up-right"
            icon-type="solid"
          />
        </div>
        <lfx-skeleton
          v-if="status === 'pending'"
          height="2rem"
          width="7.5rem"
          class="rounded-sm"
        />
      </div>

      <lfx-tabs
        v-if="!isEmpty"
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching stars"
        :is-empty="isEmpty"
        use-min-height
      >
        <div class="w-full h-[330px] mt-4">
          <lfx-chart :config="lineChartConfig" />
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
import type { StarsData } from './types/popularity.types';
import type { Summary } from '~/components/shared/types/summary.types';
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
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';
import LfxSkeleton from "~/components/uikit/skeleton/skeleton.vue";

const { startDate, endDate } = storeToRefs(useProjectStore())

const activeTab = ref('cumulative');
const route = useRoute();

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/popularity/stars`,
  {
    params: {
      type: activeTab.value,
      repository: route.params.name || '',
      startDate,
      endDate,
    }
  }
);

const stars = computed<StarsData>(() => data.value as StarsData);

const summary = computed<Summary | undefined>(() => stars.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(stars.value.data as RawChartData[], 'dateFrom', [
    'stars'
  ])
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'Cumulative', value: 'cumulative' },
  { label: 'New', value: 'new' }
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Stars',
    type: 'line',
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
  }
}));
const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  configOverride.value
));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectStars',
}
</script>
