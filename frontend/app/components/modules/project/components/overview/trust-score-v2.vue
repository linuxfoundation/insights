<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="px-6">
    <template v-if="!isArchived">
      <lfx-skeleton-state
        v-if="status === 'pending' || !isEmpty"
        :status="status"
        height="10rem"
        width="100%"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col items-start gap-3">
            <span class="text-xs font-semibold text-neutral-500 tracking-wide">HEALTH SCORE</span>
            <lfx-health-score-ring
              :score="healthScoreV2 ?? 0"
              :color="scoreColorHex"
            />
            <span
              class="text-sm font-semibold"
              :class="scoreTextColorClass"
              >{{ scoreLabel }}</span
            >
            <p
              v-if="healthScoreDescription"
              class="text-xs text-neutral-500"
            >
              {{ healthScoreDescription }}
            </p>
          </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-xs font-semibold text-neutral-500 tracking-wide">IMPACT</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-sm font-semibold text-neutral-900">{{ impactLabelDisplay }}</span>
              <span
                v-if="impactScore !== null"
                class="text-xs text-neutral-500"
                >({{ impactScore }}/100)</span
              >
            </div>
            <lfx-progress-bar
              v-if="impactScore !== null"
              :values="[impactScore]"
              color="normal"
              size="small"
              class="mt-1"
            />
            <p class="text-xs text-neutral-500">
              How central and depended-upon this project is within the open source ecosystem.
            </p>
          </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-xs font-semibold text-neutral-500 tracking-wide">LIFECYCLE</span>
            <div class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 rounded-full shrink-0"
                :class="lifecycleConfig.color"
              />
              <span class="text-sm font-semibold text-neutral-900">{{ lifecycleConfig.label }}</span>
            </div>
            <p class="text-xs text-neutral-500">
              Reflects the project's current stage of development and maintenance activity.
            </p>
          </div>
        </div>

        <hr class="border-neutral-100 my-6" />

        <div class="flex flex-row items-center justify-between flex-wrap gap-3">
          <div
            v-if="showShareBadge"
            class="w-full sm:w-auto"
          >
            <lfx-project-trust-score-share-badge :is-repo-selected="isRepoSelected" />
          </div>
          <p class="text-xs text-neutral-500">
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
    </template>

    <lfx-empty-state
      v-else-if="status !== 'pending'"
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
import LfxHealthScoreRing from './trust-score/health-score-ring.vue';
import { links } from '~/config/links';
import { getHealthScoreV2Config, getImpactLabelDisplay, getLifecycleLabelConfig } from '~~/config/trust-score';
import { lfxColors } from '~/config/styles/colors';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import LfxEmptyState from '~/components/shared/components/empty-state.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';

const props = defineProps<{
  healthScoreV2: number | null;
  healthLabel: string | null;
  impactScore: number | null;
  impactLabel: string | null;
  lifecycleLabel: string | null;
  status: AsyncDataRequestStatus;
  isRepoSelected: boolean;
}>();

const { isArchived, emptyStateTitle, emptyStateDescription, selectedRepositories } = storeToRefs(useProjectStore());

const isEmpty = computed(() => props.healthScoreV2 === null);

const showShareBadge = computed(
  () => !isEmpty.value && props.status === 'success' && selectedRepositories.value.length <= 1,
);

const scoreLabel = computed(() => getHealthScoreV2Config(props.healthLabel).label);

const scoreColorHex = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return lfxColors.positive[500];
  if (label === 'fair' || label === 'concerning') return lfxColors.warning[500];
  return lfxColors.negative[500];
});

const scoreTextColorClass = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return 'text-positive-500';
  if (label === 'fair' || label === 'concerning') return 'text-warning-500';
  return 'text-negative-500';
});

const impactLabelDisplay = computed(() => getImpactLabelDisplay(props.impactLabel));

const lifecycleConfig = computed(() => getLifecycleLabelConfig(props.lifecycleLabel));

// No backend field carries a free-text health score summary today, so a specific claim like
// the Figma copy ("solid security practices"...) can't be derived without fabricating data
// (see IN-1212 spec). Rendered as a generic, label-derived sentence instead of inventing detail.
const healthScoreDescription = computed(() => {
  if (props.healthLabel === null) return null;
  return `Overall project health is ${scoreLabel.value.toLowerCase()}, based on maintainer activity, security posture, and development cadence.`;
});
</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreV2',
};
</script>
