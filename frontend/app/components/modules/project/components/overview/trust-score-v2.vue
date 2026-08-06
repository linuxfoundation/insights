<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="px-6">
    <template v-if="!isArchived">
      <lfx-skeleton-state
        :status="status"
        height="10rem"
        width="100%"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col items-start gap-3">
            <div class="flex flex-row flex-wrap items-start justify-between gap-3 w-full">
              <div class="flex flex-col items-start gap-2">
                <span class="text-xs font-semibold text-neutral-500 tracking-wide flex items-center gap-1">
                  HEALTH SCORE
                  <lfx-tooltip placement="top">
                    <lfx-icon
                      name="circle-question"
                      :size="11"
                      class="cursor-help text-neutral-400"
                    />
                    <template #content>
                      <div class="max-w-xs text-xs leading-relaxed">
                        The Insights Health Score measures an open source project's overall trustworthiness, based on
                        maintainer activity, security posture, and development cadence.
                      </div>
                    </template>
                  </lfx-tooltip>
                </span>
                <span
                  class="text-lg font-semibold"
                  :class="isEmpty ? 'text-neutral-400' : scoreTextColorClass"
                  >{{ scoreLabel }}</span
                >
              </div>
              <lfx-health-score-ring
                :score="healthScoreV2 ?? 0"
                :color="scoreColorHex"
                :unavailable="isEmpty"
              />
            </div>
            <div class="flex-grow" />
            <p
              v-if="healthScoreDescription"
              class="text-xs text-neutral-500"
            >
              {{ healthScoreDescription }}
            </p>
          </div>

          <div class="flex flex-col items-start gap-3 md:border-l md:border-neutral-200 md:pl-6">
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
            <div class="flex-grow" />
            <p
              v-if="impactDescription"
              class="text-xs text-neutral-500"
            >
              {{ impactDescription }}
            </p>
          </div>

          <div class="flex flex-col items-start gap-3 md:border-l md:border-neutral-200 md:pl-6">
            <span class="text-xs font-semibold text-neutral-500 tracking-wide">LIFECYCLE</span>
            <div class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 rounded-full shrink-0"
                :class="lifecycleConfig.color"
              />
              <span class="text-sm font-semibold text-neutral-900">{{ lifecycleConfig.label }}</span>
            </div>
            <div class="flex-grow" />
            <p class="text-xs text-neutral-500">
              {{ lifecycleDescription }}
            </p>
          </div>
        </div>

        <div
          v-if="showShareBadge"
          class="-mx-6 mt-6"
        >
          <lfx-project-trust-score-share-badge :is-repo-selected="isRepoSelected" />
        </div>

        <!--
          Hidden per Nuno (design), 2026-08-05 Slack: no documentation exists yet for the new
          Health Score v2 formula. Re-enable once a real doc link exists — re-add
          `import { links } from '~/config/links'` and use `links.trustScore` (or the new URL) below.
        -->
        <!--
        <p class="text-xs text-neutral-500 mt-3">
          The Insights Health Score measures an open source project's overall trustworthiness.
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand-500"
            >Learn more</a
          >
        </p>
        -->
      </lfx-skeleton-state>

      <div
        v-if="status === 'error'"
        class="text-xs text-neutral-500 mt-4"
      >
        Something went wrong while loading the Health score for this project. Please try again later.
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
import { getHealthScoreV2Config, getImpactLabelDisplay, getLifecycleLabelConfig } from '~~/config/trust-score';
import { lfxColors } from '~/config/styles/colors';
import LfxSkeletonState from '~/components/modules/project/components/shared/skeleton-state.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxEmptyState from '~/components/shared/components/empty-state.vue';
import { useProjectStore } from '~/components/modules/project/store/project.store';
import {
  getLifecycleDescription,
  getHealthScoreDescription,
  getImpactSummaryDescription,
} from '~~/config/health-breakdown-templates';
import type { HealthBreakdownResults } from '~~/types/overview/responses.types';

const props = defineProps<{
  healthScoreV2: number | null;
  healthLabel: string | null;
  impactScore: number | null;
  impactLabel: string | null;
  lifecycleLabel: string | null;
  maintainerHealthScoreV2: number | null;
  securitySupplyChainScoreV2: number | null;
  developmentActivityScoreV2: number | null;
  status: AsyncDataRequestStatus;
  isRepoSelected: boolean;
  signals: HealthBreakdownResults | null;
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
  if (label === 'fair') return lfxColors.accent[500];
  if (label === 'concerning') return lfxColors.warning[500];
  return lfxColors.negative[500];
});

const scoreTextColorClass = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return 'text-positive-500';
  if (label === 'fair') return 'text-accent-500';
  if (label === 'concerning') return 'text-warning-500';
  return 'text-negative-500';
});

const impactLabelDisplay = computed(() => getImpactLabelDisplay(props.impactLabel));

const impactDescription = computed(() => getImpactSummaryDescription(props.impactLabel));

const lifecycleConfig = computed(() => getLifecycleLabelConfig(props.lifecycleLabel));

const lifecycleDescription = computed(() => getLifecycleDescription(props.lifecycleLabel, props.signals));

const healthScoreDescription = computed(() =>
  getHealthScoreDescription(
    props.healthLabel,
    props.maintainerHealthScoreV2,
    props.securitySupplyChainScoreV2,
    props.developmentActivityScoreV2,
  ),
);
</script>
<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreV2',
};
</script>
