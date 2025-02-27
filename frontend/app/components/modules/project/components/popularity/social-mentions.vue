<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Social mentions
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Social mentions are the number of times a project is mentioned on social media platforms
      during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div v-if="status === 'success'" class="flex flex-row gap-4 items-center mb-6">
        <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
        <lfx-delta-display :summary="summary" icon="circle-arrow-up-right" icon-type="solid" />
      </div>

      <lfx-tabs :tabs="tabs" :model-value="activeTab" @update:model-value="activeTab = $event" />
      <div class="w-full h-[330px] mt-5">
        <lfx-chart v-if="status !== 'pending'" :config="barChartConfig" />
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import type { SocialMentions } from './types/mentions.types';
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
import { getBarChartConfigStacked } from '~/components/uikit/chart/configs/bar.chart';
import { lfxColors } from '~/config/styles/colors';
import { axisLabelFormatter } from '~/components/uikit/chart/helpers/formatters';
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

const activeTab = ref('all-time');
const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/projects/popularity/social-mentions?interval=${activeTab.value}&project=${route.params.slug
    }&repository=${route.params.name || ''}&time-period=${props.timePeriod}`
);

const socialMentions = computed<SocialMentions>(() => data.value as SocialMentions);

const summary = computed<Summary>(() => socialMentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(socialMentions.value.data as RawChartData[], 'dateFrom', [
    'twitter',
    'reddit',
    'hackerNews',
    'stackOverflow'
  ])
);

const tabs = [
  { label: 'Mentions by platform', value: 'all-time' },
  { label: 'New mentions by platform', value: 'new-mentions' }
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Twitter',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  },
  {
    name: 'Reddit',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 1,
    position: 'left',
    color: lfxColors.negative[500]
  },
  {
    name: 'Hacker News',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 2,
    position: 'left',
    color: lfxColors.warning[500]
  },
  {
    name: 'Stack Overflow',
    type: 'bar',
    yAxisIndex: 0,
    dataIndex: 3,
    position: 'left',
    color: lfxColors.warning[200]
  }
]);
const configOverride = computed(() => ({
  xAxis: {
    axisLabel: {
      formatter: axisLabelFormatter('MMM dd')
    }
  },
  legend: {
    show: true
  },
  grid: {
    top: '8%'
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
  name: 'LfxProjectSocialMentions',
}
</script>
