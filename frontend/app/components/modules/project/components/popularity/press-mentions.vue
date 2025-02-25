<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Press mentions
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Press mentions are the number of times a project is mentioned in the press
      during the selected time period.
    </p>
    <hr>
    <section class="mt-5">
      <div v-if="status === 'success'" class="flex flex-row gap-4 items-center mb-6">
        <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
        <lfx-delta-display :summary="summary" icon="circle-arrow-up-right" icon-type="solid" />
      </div>

      <div class="w-full h-[330px] my-5">
        <lfx-chart v-if="status !== 'pending'" :config="lineAreaChartConfig" />
        <lfx-spinner v-else />
      </div>

      <lfx-project-press-mention-lists :list="list" />
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import type { PressMentions, PressMention } from './types/mentions.types';
import LfxProjectPressMentionLists from './fragments/press-mention-lists.vue';
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
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
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

const route = useRoute();

const { data, status, error } = useFetch(
  () => `/api/projects/contributors/press-mentions?project=${route.params.slug
    }&repository=${route.params.name || ''}&time-period=${props.timePeriod}`
);

const mentions = computed<PressMentions>(() => data.value as PressMentions);

const summary = computed<Summary>(() => mentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(mentions.value.data as RawChartData[], 'dateFrom', [
    'mentions'
  ])
);

const list = computed<PressMention[]>(() => mentions.value.list);

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Press Mentions',
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
const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  configOverride.value
));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching press mentions: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPressMentions',
}
</script>
