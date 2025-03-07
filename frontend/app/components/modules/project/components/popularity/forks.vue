<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Forks
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Active contributor is an individual performing tasks such as commits,
      issues, or pull requests during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-6">
        <lfx-skeleton-state
          :status="status"
          height="2rem"
          width="7.5rem"
        >
          <div
            v-if="summary"
            class="flex flex-row gap-4 items-center"
          >
            <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
            <lfx-delta-display
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
        :status="status"
        :error="error"
        error-message="Error fetching forks"
        :is-empty="isEmpty"
        use-min-height
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
import { ref, computed } from 'vue';
import { storeToRefs } from "pinia";
import LfxProjectLoadState from '../shared/load-state.vue';
import LfxSkeletonState from '../shared/skeleton-state.vue';
import type { ForksData } from './types/popularity.types';
import { lineGranularities, barGranularities } from '~/components/shared/types/granularity';
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
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { isEmptyData } from '~/components/shared/utils/helper';

const {
  startDate, endDate, selectedRepository, selectedKey
} = storeToRefs(useProjectStore())

const activeTab = ref('cumulative');
const route = useRoute();

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/popularity/forks`,
  {
    params: {
      granularity: activeTab.value === 'cumulative'
        ? lineGranularities[selectedKey.value as keyof typeof lineGranularities].granularity
        : barGranularities[selectedKey.value as keyof typeof barGranularities].granularity,
      type: activeTab.value,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const forks = computed<ForksData | undefined>(() => data.value as ForksData);

const summary = computed<Summary | undefined>(() => forks.value?.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(forks.value?.data as RawChartData[], 'dateFrom', [
    'forks'
  ])
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));
const axisLabelFormat = computed(() => (activeTab.value === 'cumulative'
  ? lineGranularities[selectedKey.value as keyof typeof lineGranularities].format
  : barGranularities[selectedKey.value as keyof typeof barGranularities].format));

const tabs = [
  { label: 'Cumulative', value: 'cumulative' },
  { label: 'New', value: 'new' }
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Forks',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);
const configOverride = computed(() => ({
  xAxis: {
    axisLabel: {
      formatter: axisLabelFormatter(axisLabelFormat.value)
    }
  }
}));
const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  configOverride.value
));
const barChartConfig = computed(() => getBarChartConfig(
  chartData.value,
  chartSeries.value,
  configOverride.value
));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectForks',
}
</script>
