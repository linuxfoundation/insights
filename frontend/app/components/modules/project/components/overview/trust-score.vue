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
                  project's overall health.
                  <a
                    :href="links.trustScore"
                    target="_blank"
                    class="text-brand-500"
                  >Learn more</a>
                </p>
              </div>

              <lfx-project-trust-score-display
                :overall-score="overallScore"
                :hide-overall-score="hideOverallScore"
              />
              <div
                class="block"
              >
                <div class="text-xs text-neutral-500">
                  Health Score is unavailable because the required metrics aren't configured for this project.
                </div>
              </div>
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
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import { overviewScore } from '~~/app/components/shared/utils/overview-score';

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  scoreDisplay: ScoreDisplay;
}>();

const overallScore = computed(() => (props.trustScoreSummary ? (props.trustScoreSummary).overall : 0));
const hideOverallScore = computed(() => Object.values(props.scoreDisplay).some((score) => !score));

const chartData = computed<ChartData[]>(
  // convert the data to chart data
  () => {
    const score = overviewScore(props.trustScoreSummary, props.scoreDisplay);

    if (!score) {
      return [];
    }

    return [
      {
        key: 'popularity',
        values: [score.popularity]
      },
      {
        key: 'contributors',
        values: [score.contributors]
      },
      {
        key: 'security',
        values: [score.security]
      },
      {
        key: 'development',
        values: [score.development]
      }
    ];
  }
);

const isEmpty = computed(() => isEmptyData(chartData.value as unknown as Record<string, unknown>[]));
</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScore'
};
</script>
