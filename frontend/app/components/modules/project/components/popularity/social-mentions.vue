<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Social mentions
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Number of times that {{ keyword }} was mentioned on social platforms during the selected period.
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
          <lfx-chart :config="activeTab === 'cumulative' ? lineChartConfig : barChartConfig">
            <template #legend>
              <div class="flex flex-row gap-5 items-center justify-center pt-2">
                <div class="flex flex-row items-center gap-2">
                  <div class="w-3 h-3 bg-brand-500 rounded-xs" />
                  <span class="text-xs text-neutral-900">X/Twitter</span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <div class="w-3 h-3 bg-negative-500 rounded-xs" />
                  <span class="text-xs text-neutral-900">Reddit</span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <div class="w-3 h-3 bg-warning-500 rounded-xs" />
                  <span class="text-xs text-neutral-900">Hacker News</span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <div class="w-3 h-3 bg-yellow rounded-xs" />
                  <span class="text-xs text-neutral-900">Stack Overflow</span>
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
import { ref, computed, watch } from 'vue';
import { storeToRefs } from "pinia";
import type { SocialMentions } from '~~/types/popularity/responses.types';
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
import { getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { links } from '~/config/links';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import type { Granularity } from '~~/types/shared/granularity';
import { barGranularities, lineGranularities } from '~/components/shared/types/granularity';

const { showToast } = useToastService();
const {
  startDate,
  endDate,
  selectedRepository,
  project,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())
const keyword = computed(() => project.value?.name);

const activeTab = ref('cumulative');
const route = useRoute();

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
  `/api/project/${route.params.slug}/popularity/social-mentions`,
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

const socialMentions = computed<SocialMentions>(() => data.value as SocialMentions);

const summary = computed<Summary>(() => socialMentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(socialMentions.value.data as RawChartData[], 'startDate', [
    'twitter',
    'reddit',
    'hackerNews',
    'stackOverflow'
  ])
);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

const tabs = [
  { label: 'Mentions by platform', value: 'cumulative' },
  { label: 'New mentions by platform', value: 'new-mentions' }
];

const chartSeries = computed<ChartSeries[]>(() => [
  {
    name: 'Twitter',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  },
  {
    name: 'Reddit',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.negative[500]
  },
  {
    name: 'Hacker News',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.warning[500]
  },
  {
    name: 'Stack Overflow',
    type: activeTab.value === 'cumulative' ? 'line' : 'bar',
    yAxisIndex: 0,
    dataIndex: 3,
    position: 'left',
    color: lfxColors.warning[200]
  }
]);
const lineChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  lineGranularity.value
));
const barChartConfig = computed(() => getBarChartConfigStacked(
  chartData.value,
  chartSeries.value,
  barGranularity.value
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
  name: 'LfxProjectSocialMentions',
}
</script>
