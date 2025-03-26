<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Press mentions
    </h3>
    <p class="text-body-2 text-neutral-500 mb-6">
      Number of times that {{ keyword }} was mentioned in news and articles during the selected period.
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

      <lfx-project-load-state
        :status="status"
        :error="error"
        error-message="Error fetching social mentions"
        :is-empty="isEmpty"
      >
        <div class="w-full h-[320px] my-5">
          <lfx-chart :config="lineAreaChartConfig" />
        </div>
        <lfx-project-press-mention-lists :list="list" />
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
import LfxProjectPressMentionLists from './fragments/press-mention-lists.vue';
import type { PressMentions, PressMention } from '~~/types/popularity/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
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
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from "~/components/modules/project/store/project.store";
import { links } from '~/config/links';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';

const {
  startDate,
  endDate,
  selectedRepository,
  project,
  selectedTimeRangeKey,
  customRangeGranularity
} = storeToRefs(useProjectStore())

const route = useRoute();
const keyword = computed(() => project.value?.name);

const granularity = computed(() => (selectedTimeRangeKey.value === dateOptKeys.custom
  ? customRangeGranularity.value[0] as Granularity
  : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities]));

const { data, status, error } = useFetch(
  () => `/api/project/${route.params.slug}/popularity/press-mentions`,
  {
    params: {
      granularity,
      repository: selectedRepository,
      startDate,
      endDate,
    }
  }
);

const mentions = computed<PressMentions>(() => data.value as PressMentions);

const summary = computed<Summary>(() => mentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => convertToChartData(mentions.value.data as RawChartData[], 'startDate', [
    'mentions'
  ])
);
const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));

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

const lineAreaChartConfig = computed(() => getLineAreaChartConfig(
  chartData.value,
  chartSeries.value,
  granularity.value
));
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPressMentions',
}
</script>
