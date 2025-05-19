<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="p-6">
      <div class="flex flex-row justify-between">
        <div
          class="pr-6 w-full"
          :class="{
            'sm:basis-1/2': !hideOverallScore,
          }"
        >
          <div class="flex flex-col justify-between h-full">
            <div>
              <h3 class="text-heading-3 font-bold font-secondary mb-2">Health score</h3>
              <p class="text-xs text-neutral-500">
                The Health Score combines the four key areas to measure an open source
                project's overall health.
                <a
                  :href="links.trustScore"
                  target="_blank"
                  class="text-brand-500"
                >Learn more</a>
              </p>
            </div>
            <template v-if="status === 'success' && !isEmpty">
              <lfx-project-trust-score-display
                :overall-score="overallScore"
                :hide-overall-score="hideOverallScore"
              />
              <div
                v-if="hideOverallScore"
                class="block"
              >
                <div class="text-xs text-neutral-500 mt-4">
                  The Health Score is unavailable because Insights does not have sufficiently meaningful metrics.
                </div>
              </div>
            </template>
          </div>
        </div>
        <div
          v-if="!hideOverallScore && status === 'success'"
          class="sm:basis-1/2 hidden sm:block"
        >
          <lfx-project-trust-score-chart :chart-data="chartData" />
        </div>
      </div>
      <div
        v-if="status === 'pending'"
        class="flex flex-col items-center justify-center h-[140px]"
      >
        <lfx-spinner
          :size="40"
          class="text-neutral-300"
          :type="'light'"
        />
        <div class="text-sm text-neutral-500">
          Loading data...
        </div>
      </div>
      <div
        v-if="isEmpty"
        class="flex flex-col items-center justify-center h-[240px]"
      >
        <lfx-icon
          name="eyes"
          :size="40"
          class="text-neutral-300"
        />
        <p class="text-sm text-neutral-500 mt-5">
          No data available
        </p>
      </div>
    </div>
    <div
      v-if="!hideOverallScore"
      class="px-6 py-2 border-t border-neutral-100 bg-neutral-50 flex items-center justify-center"
    >
      <p class="text-xs leading-4.5 text-neutral-500">
        Share your project Health Score in your GitHub page.
        <span
          class="text-brand-500 cursor-pointer"
          @click="isGithubBadgeModalOpen = true"
        >Generate badge</span>
      </p>
    </div>
  </lfx-card>
  <lfx-trust-score-github-badge
    v-if="isGithubBadgeModalOpen"
    v-model="isGithubBadgeModalOpen"
    :overall-score="overallScore"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectTrustScoreDisplay from './trust-score/score-display.vue';
import LfxProjectTrustScoreChart from './trust-score/score-chart.vue';
import LfxCard from '~/components/uikit/card/card.vue';
import { links } from '~/config/links';
import { isEmptyData } from '~~/app/components/shared/utils/helper';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import type { ChartData } from '~~/app/components/uikit/chart/types/ChartTypes';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import { overviewScore } from '~~/app/components/shared/utils/overview-score';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTrustScoreGithubBadge from "~/components/modules/project/components/overview/trust-score/gh-badge.vue";

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  scoreDisplay: ScoreDisplay;
}>();

const isGithubBadgeModalOpen = ref(false);

const overallScore = computed(() => Math.round((props.trustScoreSummary ? (props.trustScoreSummary).overall : 0)));
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
