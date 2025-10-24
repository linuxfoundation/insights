<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section class="mt-5">
    <div class="mb-5">
      <lfx-skeleton-state
        :status="status"
        height="2rem"
        width="7.5rem"
      >
        <div
          v-if="summary && !isEmpty"
          class="flex flex-row gap-4 items-center"
        >
          <div class="text-data-display-1">{{ formatNumber(summary.current) }}</div>
          <lfx-delta-display
            v-if="selectedTimeRangeKey !== dateOptKeys.alltime"
            :summary="summary"
          />
        </div>
      </lfx-skeleton-state>
    </div>

    <div
      v-if="props.snapshot"
      class="text-sm leading-4 font-semibold first-letter:uppercase pb-3 border-t border-neutral-100 pt-5"
    >
      {{ granularity }} mentions growth
    </div>

    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching press mentions"
      :is-empty="isEmpty"
    >
      <div class="w-full h-[320px] mt-5">
        <lfx-chart
          :config="lineAreaChartConfig"
          :animation="!props.snapshot"
        />
      </div>
      <lfx-project-press-mention-lists
        v-if="!props.snapshot"
        class="mt-5"
        :list="list"
      />
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { PressMentions, PressMention } from '~~/types/popularity/responses.types';
import type { Summary } from '~~/types/shared/summary.types';
import LfxDeltaDisplay from '~/components/uikit/delta-display/delta-display.vue';
import { convertToChartData } from '~/components/uikit/chart/helpers/chart-helpers';
import type { ChartData, RawChartData, ChartSeries } from '~/components/uikit/chart/types/ChartTypes';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { getLineAreaChartConfig } from '~/components/uikit/chart/configs/line.area.chart';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import { dateOptKeys } from '~/components/modules/project/config/date-options';
import { isEmptyData } from '~/components/shared/utils/helper';
import { lineGranularities } from '~/components/shared/types/granularity';
import type { Granularity } from '~~/types/shared/granularity';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import LfxProjectPressMentionLists from '~/components/modules/widget/components/popularity/fragments/press-mention-lists.vue';
import { Widget } from '~/components/modules/widget/types/widget';
import { POPULARITY_API_SERVICE } from '~/components/modules/widget/services/popularity.api.service';

const props = defineProps<{
  snapshot?: boolean;
}>();

const emit = defineEmits<{ (e: 'dataLoaded', value: string): void }>();

const { startDate, endDate, selectedReposValues, selectedTimeRangeKey, customRangeGranularity } =
  storeToRefs(useProjectStore());

const route = useRoute();

const granularity = computed(() =>
  selectedTimeRangeKey.value === dateOptKeys.custom
    ? (customRangeGranularity.value[0] as Granularity)
    : lineGranularities[selectedTimeRangeKey.value as keyof typeof lineGranularities],
);

const queryParams = computed(() => ({
  projectSlug: route.params.slug as string,
  granularity: granularity.value,
  repos: selectedReposValues.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));

const { data, status, error } = POPULARITY_API_SERVICE.fetchPressMentions(queryParams);

const mentions = computed<PressMentions>(() => data.value as PressMentions);

const summary = computed<Summary>(() => mentions.value.summary);
const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () =>
    convertToChartData((mentions.value?.data || []) as RawChartData[], 'startDate', ['mentions'], undefined, 'endDate'),
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
    color: lfxColors.brand[500],
  },
]);

const lineAreaChartConfig = computed(() =>
  getLineAreaChartConfig(chartData.value, chartSeries.value, granularity.value),
);

watch(
  status,
  (value: string) => {
    if (value !== 'pending') {
      emit('dataLoaded', Widget.PRESS_MENTIONS);
    }
  },
  {
    immediate: true,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxProjectPressMentions',
};
</script>
