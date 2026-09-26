<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-popover
    placement="top"
    trigger-event="hover"
  >
    <lfx-chip
      v-if="props.unavailable"
      type="bordered"
      size="small"
    >
      <span class="text-xs font-medium text-neutral-500">Unavailable</span>
    </lfx-chip>
    <lfx-chip
      v-else
      type="bordered"
      size="small"
      class="flex items-center gap-1"
    >
      <span
        class="size-1.5 rounded-full shrink-0"
        :class="healthScoreDotClass"
      />
      <span class="text-xs font-medium text-neutral-900">{{ healthScoreLabel }}</span>
      <span class="text-xs font-medium text-neutral-500">({{ props.score }}/{{ maxScore }})</span>
    </lfx-chip>

    <template #content>
      <div
        v-if="props.unavailable"
        class="w-64 text-xs bg-white border border-neutral-100 rounded-xl shadow-xl p-3"
      >
        <p class="text-neutral-500">Health score is unavailable for this collection.</p>
      </div>
      <div
        v-else
        class="w-80 flex flex-col gap-4 text-xs bg-white border border-neutral-200 rounded-xl shadow-xl p-3"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 text-sm leading-5">
            <span
              class="size-2 rounded-full shrink-0"
              :class="healthScoreDotClass"
            />
            <span>
              <span class="font-semibold text-neutral-900">{{ healthScoreLabel }}</span>
              <span class="text-neutral-500"> ({{ props.score }}/{{ maxScore }})</span>
            </span>
          </div>
          <lfx-progress-bar
            :values="[props.score]"
            :color="progressBarColor"
            :missing="isPartial ? 100 - maxScore : undefined"
            size="small"
          />
          <p
            v-if="healthScoreDescription"
            class="text-neutral-600"
          >
            {{ healthScoreDescription }}
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="category in categories"
            :key="category.key"
            class="flex items-center gap-2 leading-4"
          >
            <span class="size-5 rounded-full bg-white flex items-center justify-center shrink-0">
              <lfx-icon
                :name="category.icon"
                :size="11"
                class="text-neutral-400"
              />
            </span>
            <span class="font-medium text-neutral-900">{{ category.name }}</span>
            <span class="ml-auto shrink-0">
              <span class="font-semibold text-neutral-900">{{ category.score ?? '—' }}</span
              ><span class="text-neutral-400">/{{ category.max }}</span>
            </span>
          </div>
        </div>
        <template v-if="isPartial && missingCategoryName">
          <div class="h-px bg-neutral-200" />
          <p class="text-2xs leading-[14px] text-neutral-400 italic">
            *The Health score is partial because the {{ missingCategoryName }} category is missing data for this
            project.
          </p>
        </template>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import { getHealthScoreDescription, getMissingHealthCategoryName } from '~~/config/health-breakdown-templates';
import { getHealthScoreV2Config, isPartialHealthScore } from '~~/config/trust-score';

const props = defineProps<{
  score: number;
  healthLabel?: string | null;
  unavailable?: boolean;
  maintainerHealthScoreV2?: number | null;
  securitySupplyChainScoreV2?: number | null;
  developmentActivityScoreV2?: number | null;
  healthMaxScore?: number | null;
}>();

// Akrites v2 bands (PRD): excellent 85-100, healthy 70-84, fair 50-69, concerning 30-49, critical 0-29.
// Prefers the server-computed healthLabel (Akrites package rollup); falls back to client banding
// only when the server label is absent, per the ticket's "derivable frontend-side" allowance.
const bandFromScore = (score: number) => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'healthy';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'concerning';
  return 'critical';
};

const band = computed(() => (props.healthLabel ?? bandFromScore(props.score)).toLowerCase());

const isPartial = computed(() => isPartialHealthScore(props.healthMaxScore ?? null));
const maxScore = computed(() => props.healthMaxScore ?? 100);

const healthScoreLabel = computed(() => getHealthScoreV2Config(band.value, isPartial.value).label);

const missingCategoryName = computed(() =>
  getMissingHealthCategoryName(
    props.maintainerHealthScoreV2 ?? null,
    props.securitySupplyChainScoreV2 ?? null,
    props.developmentActivityScoreV2 ?? null,
  ),
);

const healthScoreDotClass = computed(() => {
  const classes: Record<string, string> = {
    excellent: 'bg-health-excellent',
    healthy: 'bg-health-healthy',
    fair: 'bg-health-fair',
    concerning: 'bg-health-concerning',
    critical: 'bg-health-critical',
  };
  return classes[band.value] ?? 'bg-health-critical';
});

const progressBarColor = computed(() => {
  if (band.value === 'excellent' || band.value === 'healthy') return 'positive';
  if (band.value === 'fair') return 'accent';
  if (band.value === 'concerning') return 'warning';
  return 'negative';
});

const healthScoreDescription = computed(() =>
  getHealthScoreDescription(
    props.healthLabel ?? null,
    props.maintainerHealthScoreV2 ?? null,
    props.securitySupplyChainScoreV2 ?? null,
    props.developmentActivityScoreV2 ?? null,
  ),
);

const categories = computed(() => [
  {
    key: 'maintainer-health',
    name: 'Maintainer Health',
    icon: 'heart-pulse',
    score: props.maintainerHealthScoreV2 ?? null,
    max: 40,
  },
  {
    key: 'security-supply-chain',
    name: 'Security & Supply Chain',
    icon: 'shield-check',
    score: props.securitySupplyChainScoreV2 ?? null,
    max: 35,
  },
  {
    key: 'development-activity',
    name: 'Development Activity',
    icon: 'laptop-code',
    score: props.developmentActivityScoreV2 ?? null,
    max: 25,
  },
]);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHealthScorePill',
};
</script>
