<template>
  <lfx-card class="p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      GitHub Mentions
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      GitHub mentions are the number of times a project is mentioned on GitHub during the selected
      time period.
    </p>
    <hr>
    <section class="mt-5">
      <div
        v-if="status === 'success'"
        class="flex flex-row gap-4 items-center mb-6"
      >
        <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
        <lfx-delta-display
          :summary="summary"
          icon="circle-arrow-up-right"
          icon-type="solid"
        />
      </div>

      <lfx-tabs
        :tabs="tabs"
        :model-value="activeTab"
        @update:model-value="activeTab = $event"
      />
      <div class="w-full h-[330px] mt-5">
        <lfx-chart
          v-if="status !== 'pending'"
          :config="lineAreaChartConfig"
        />
        <lfx-spinner v-else />
      </div>
    </section>
  </lfx-card>
</template>

<script setup lang="ts">
import { useFetch, useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from "pinia";
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
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";

const { showToast } = useToastService();
const { startDate, endDate, selectedRepository } = storeToRefs(useProjectStore())

const activeTab = ref('cumulative');
const route = useRoute();

const { data, status, error } = useFetch(
  `/api/project/${route.params.slug}/popularity/github-mentions`,
  {
    params: {
      interval: activeTab.value,
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
  () => convertToChartData(mentions.value.data as RawChartData[], 'dateFrom', [
    'mentions'
  ])
);

const tabs = [
  { label: 'Cumulative', value: 'cumulative' },
  { label: 'New Mentions', value: 'new-mentions' }
];

const chartSeries = ref<ChartSeries[]>([
  {
    name: 'Github Mentions',
    type: 'line',
    yAxisIndex: 0,
    dataIndex: 0,
    position: 'left',
    color: lfxColors.brand[500]
  }
]);

const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  'weekly'
));

watch(error, (err) => {
  if (err) {
    showToast(
      `Error fetching github mentions: ${error.value?.statusMessage}`,
      ToastTypesEnum.negative,
      undefined,
      10000
    );
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectGithubMentions',
}
</script>
