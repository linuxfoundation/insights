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
          v-if="status === 'error'"
          class="text-xs text-neutral-500 mt-4"
        >
          Something went wrong while loading the Health score for this project. Please try again later.
        </div>
        <div
          v-else-if="isEmpty && status !== 'pending'"
          class="text-xs text-neutral-500 mt-4"
        >
          LFX Insights does not have enough meaningful data to generate an overall Health score for this project.
        </div>
        <template v-else>
          <div
            v-if="isRepoSelected"
            class="text-xs text-brand-600 font-semibold inline-flex items-center gap-1 mt-2 bg-brand-50 rounded-full px-1.5"
          >
            <lfx-icon
              name="info-circle"
              :size="12"
              type="solid"
              class="text-brand-600"
            />
            Select "All repositories" in order to get the aggregated Health Score
          </div>
          <p class="text-xs text-neutral-500 mt-4">
            The Insights Health Score measures an open source project's overall trustworthiness.
            <a
              :href="links.trustScore"
              target="_blank"
              rel="noopener noreferrer"
              class="text-brand-500"
              >Learn more</a
            >
          </p>
        </template>
      </div>
      <div
        v-if="!isEmpty && status === 'success'"
        class="w-[200px] hidden sm:block"
      >
        <lfx-project-trust-score-share-badge />
      </div>
    </div>

    <lfx-empty-state
      v-if="isArchived && status !== 'pending'"
      icon="archive"
      :title="emptyStateTitle"
      :description="emptyStateDescription"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AsyncDataRequestStatus } from 'nuxt/app';
import { storeToRefs } from 'pinia';
import LfxProjectTrustScoreShareBadge from './trust-score/share-badge.vue';
import { links } from '~/config/links';
import { getHealthScoreV2Config } from '~~/config/trust-score';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxEmptyState from '~/components/shared/components/empty-state.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const props = defineProps<{
  healthScoreV2: number | null;
  healthLabel: string | null;
  status: AsyncDataRequestStatus;
  isRepoSelected: boolean;
}>();

const { isArchived, emptyStateTitle, emptyStateDescription } = storeToRefs(useProjectStore());

const isEmpty = computed(() => props.healthScoreV2 === null);

const scoreLabel = computed(() => getHealthScoreV2Config(props.healthLabel).label);

const scoreColorClass = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return 'bg-positive-500';
  if (label === 'fair' || label === 'concerning') return 'bg-health-concerning';
  return 'bg-negative-500';
});
</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreV2',
};
</script>
