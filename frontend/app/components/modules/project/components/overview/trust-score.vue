<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="px-6">
    <div class="flex flex-row justify-between">
      <div
        class="pr-6 w-full"
        :class="{
          'sm:basis-3/5': !hideOverallScore,
        }"
      >
        <div class="flex flex-col justify-between h-full">
          <div>
            <h3 class="text-heading-3 font-bold font-secondary mb-2">Health score</h3>

            <lfx-skeleton-state
              :status="status"
              height="1.75rem"
              width="11.5rem"
            >
              <lfx-project-trust-score-display
                :overall-score="overallScore"
                :hide-overall-score="hideOverallScore"
              />
            </lfx-skeleton-state>

            <div
              v-if="(hideOverallScore || isEmpty) && status !== 'pending'"
              class="block"
            >
              <div class="text-xs text-neutral-500 mt-4">
                LFX Insights does not have enough meaningful data to generate an overall Health score for this project.
              </div>
            </div>

            <p
              v-else
              class="text-xs text-neutral-500 mt-4"
            >
              The Insights Health Score combines the four key areas to
              measure an open source project's overall trustworthiness.
              <a
                :href="links.trustScore"
                target="_blank"
                class="text-brand-500"
              >Learn more</a>
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="!hideOverallScore && status === 'success'"
        class="w-[200px] hidden sm:block"
      >
        <lfx-project-trust-score-share-badge
          v-if="!hideOverallScore"
          :overall-score="overallScore"
        />
      </div>
    </div>

    <div
      v-if="isEmpty && status !== 'pending'"
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectTrustScoreDisplay from './trust-score/score-display.vue';
import LfxProjectTrustScoreShareBadge from './trust-score/share-badge.vue';
import { links } from '~/config/links';
import { isEmptyData } from '~~/app/components/shared/utils/helper';
import type { ChartData } from '~~/app/components/uikit/chart/types/ChartTypes';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import { overviewScore } from '~~/app/components/shared/utils/overview-score';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  scoreDisplay: ScoreDisplay;
}>();

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
