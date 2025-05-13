<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="p-6">
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching trust score data"
      :is-empty="isEmpty"
    >
      <div class="h-[280px]">
        <div class="flex flex-row justify-between">
          <div class="pr-6 sm:basis-1/2 w-full">
            <div class="flex flex-col justify-between h-full">
              <div>
                <h3 class="text-heading-3 font-bold font-secondary mb-2">Health score</h3>
                <p class="text-xs text-neutral-500">
                  The Insights Trust Score combines the four key areas to measure an open source
                  project's overall trustworthiness.
                  <a
                    :href="links.learnMore"
                    target="_blank"
                    class="text-brand-500"
                  >Learn more</a>
                </p>
              </div>

              <lfx-project-trust-score-display :overall-score="overallScore" />
            </div>
          </div>
          <div class="sm:basis-1/2 hidden sm:block">
            <lfx-project-trust-score-chart :chart-data="chartData" />
          </div>
        </div>
      </div>
    </lfx-project-load-state>
  </lfx-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectTrustScoreDisplay from './trust-score/score-display.vue';
import LfxProjectTrustScoreChart from './trust-score/score-chart.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import { links } from '~/config/links';
import { isEmptyData } from '~~/app/components/shared/utils/helper';
import LfxProjectLoadState from '~~/app/components/modules/project/components/shared/load-state.vue';
import type { ChartData } from '~~/app/components/uikit/chart/types/ChartTypes';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
}>();

const overallScore = computed(() => (props.trustScoreSummary ? (props.trustScoreSummary).overall : 0));

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    if (!props.trustScoreSummary) {
      return [];
    }

    return [
      {
        key: 'popularity',
        values: [normalizeChartValue(props.trustScoreSummary.popularity)]
      },
      {
        key: 'contributors',
        values: [normalizeChartValue(props.trustScoreSummary.contributors)]
      },
      {
        key: 'security',
        values: [normalizeChartValue(props.trustScoreSummary.security)]
      },
      {
        key: 'development',
        values: [normalizeChartValue(props.trustScoreSummary.development)]
      }
    ];
  }
);

const normalizeChartValue = (value: number) => (value / 25) * 100;

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));
</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScore'
};
</script>
