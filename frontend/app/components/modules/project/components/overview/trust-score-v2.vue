<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="px-6">
    <div class="flex flex-row justify-between">
      <div class="pr-6 w-full">
        <h2 class="text-heading-3 font-bold font-secondary mb-2">Health score</h2>

        <lfx-skeleton-state
          v-if="status === 'pending' || !isEmpty"
          :status="status"
          height="1.75rem"
          width="11.5rem"
        >
          <div class="flex items-center gap-3 text-3xl font-bold cursor-default">
            <div
              class="h-3 w-3 rounded-full shrink-0"
              :class="scoreColorClass"
            />
            {{ scoreLabel }}
            <span
              v-if="healthScoreV2 !== null"
              class="text-neutral-500 text-lg font-semibold"
              >{{ healthScoreV2 }}/100</span
            >
          </div>
        </lfx-skeleton-state>

        <div
          v-if="isEmpty && status !== 'pending'"
          class="text-xs text-neutral-500 mt-4"
        >
          LFX Insights does not have enough meaningful data to generate an overall Health score for this project.
        </div>
        <p
          v-else
          class="text-xs text-neutral-500 mt-4"
        >
          The Insights Health Score measures an open source project's overall trustworthiness.
          <a
            :href="links.trustScore"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-500"
            >Learn more</a
          >
        </p>
      </div>
      <div
        v-if="!isEmpty && status === 'success'"
        class="w-[200px] hidden sm:block"
      >
        <lfx-project-trust-score-share-badge />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import LfxProjectTrustScoreShareBadge from './trust-score/share-badge.vue';
import { links } from '~/config/links';
import { getHealthScoreV2Config } from '~~/config/trust-score';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';

const props = defineProps<{
  healthScoreV2: number | null;
  healthLabel: string | null;
  status: AsyncDataRequestStatus;
}>();

const isEmpty = computed(() => props.healthScoreV2 === null);

const scoreLabel = computed(() => getHealthScoreV2Config(props.healthLabel).label);

const scoreColorClass = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return 'bg-positive-500';
  if (label === 'fair') return 'bg-brand-500';
  if (label === 'concerning') return 'bg-warning-500';
  return 'bg-negative-500';
});
</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreV2',
};
</script>
