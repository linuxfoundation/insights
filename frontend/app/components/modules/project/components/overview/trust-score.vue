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
          'sm:basis-3/5': !hideOverallScore && !isRepoSelected,
        }"
      >
        <div class="flex flex-col justify-between h-full">
          <div>
            <h3 class="text-heading-3 font-bold font-secondary mb-2">Health score</h3>

            <lfx-skeleton-state
              v-if="!isRepoSelected"
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

            <template v-else>
              <div
                v-if="isRepoSelected"
                class="text-xs text-brand-600 font-semibold inline-flex
                items-center gap-1 mt-2 bg-brand-50 rounded-full px-1.5"
              >
                <lfx-icon
                  name="info-circle"
                  :size="12"
                  type="solid"
                  class="text-brand-600"
                />
                Select “All repositories” in order to get the aggregated Health Score
              </div>
              <p
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
            </template>
          </div>
        </div>
      </div>
      <div
        v-if="!hideOverallScore && status === 'success' && selectedRepositories.length <= 1"
        class="w-[200px] hidden sm:block"
      >
        <lfx-project-trust-score-share-badge
          v-if="!hideOverallScore"
          :overall-score="overallScore"
          :is-repo-selected="isRepoSelected"
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
import {storeToRefs} from "pinia";
import LfxProjectTrustScoreDisplay from './trust-score/score-display.vue';
import LfxProjectTrustScoreShareBadge from './trust-score/share-badge.vue';
import { links } from '~/config/links';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import type { ScoreDisplay } from '~~/types/overview/score-display.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSkeletonState from "~/components/modules/project/components/shared/skeleton-state.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const props = defineProps<{
  trustScoreSummary: TrustScoreSummary | undefined;
  status: AsyncDataRequestStatus;
  error: unknown;
  scoreDisplay: ScoreDisplay;
  isRepoSelected: boolean;
}>();

const overallScore = computed(() => Math.round((props.trustScoreSummary ? (props.trustScoreSummary).overall : 0)));
const hideOverallScore = computed(() => Object.values(props.scoreDisplay).some((score) => !score));
const { selectedRepositories } = storeToRefs(useProjectStore());

const isEmpty = computed(() => [
  props.trustScoreSummary?.overall,
  props.trustScoreSummary?.contributors,
  props.trustScoreSummary?.popularity,
  props.trustScoreSummary?.development,
  props.trustScoreSummary?.security,
].every((score) => score === 0));

</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScore'
};
</script>
