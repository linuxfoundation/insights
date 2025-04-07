<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      GitHub Mentions
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Number of times that {{ keyword }} was mentioned on code, files, and paths across GitHub repositories.
      <a
        :href="links.learnMore"
        class="text-brand-500"
        target="_blank"
      >Learn more</a>
    </p>
    <hr>
    <section class="mt-5">
      <div class="mb-5">
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
              v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
              :summary="summary"
              icon="circle-arrow-up-right"
              icon-type="solid"
            />
          </div>
        </lfx-skeleton-state>
      </div>

      <lfx-tabs
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching social mentions"
        :is-empty="isEmpty"
      >
        <div class="w-full h-[320px] mt-5">
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
import type { GithubMentions } from '~~/types/popularity/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
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
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { getBarChartConfig } from '~/components/uikit/chart/configs/bar.chart';
import { barGranularities, lineGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';
import { links } from '~/config/links';

const {
  startDate,
  endDate,
  selectedRepository,
  project,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())

const activeTab = ref('new-mentions');
const route = useRoute();
const keyword = computed(() => project.value?.name);

const barGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : barGranularities[selectedTimeRangeKey.value as keyof typeof barGranularities]));
const lineGranularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));
const granularity = computed(() => (activeTab.value === 'cumulative'
  ? lineGranularity.value
  : barGranularity.value));

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/popularity/github-mentions`,
  {
    params: {
      granularity,
      type: activeTab,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const mentions = computed<GithubMentions>(() => data.value as GithubMentions);

const summary = computed<Summary>(() => mentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData((mentions.value?.data || []) as RawChartData[], 'startDate', [
    'mentions'
  ], undefined, 'endDate')
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'New Mentions', value: 'new-mentions' },
  { label: 'Cumulative', value: 'cumulative' },
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Github Mentions',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  lineGranularity.value
));

const barChartConfig = computed(() => getBarChartConfig(
  chartData.value,
  chartSeries.value,
  barGranularity.value
));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectGithubMentions',
}
</script>
