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
      v-if="props.score === null || props.score === undefined"
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
      <span class="text-xs font-medium text-neutral-900">{{ impactScoreLabel }}</span>
      <span class="text-xs font-medium text-neutral-500">({{ props.score }})</span>
    </lfx-chip>

    <template #content>
      <div class="w-64 space-y-3 text-xs bg-white border border-neutral-100 rounded-xl shadow-xl p-3">
        <div class="flex items-center gap-1.5">
          <span class="font-semibold text-neutral-900">{{ impactScoreLabel }}</span>
          <span class="text-neutral-500">({{ props.score ?? 0 }}/100)</span>
        </div>
        <lfx-progress-bar
          :values="[props.score ?? 0]"
          color="normal"
          size="small"
        />
        <p
          v-if="impactDescription"
          class="text-neutral-500"
        >
          {{ impactDescription }}
        </p>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import { getImpactSummaryDescription } from '~~/config/health-breakdown-templates';

const props = defineProps<{
  score: number | null;
  impactLabel?: string | null;
}>();

// Akrites impact bands (PRD alt-label tiers): foundational 85-100, major 60-84, moderate 30-59, minor 0-29.
// Prefers the server-computed impactLabel; falls back to client banding if absent.
const bandFromScore = (score: number) => {
  if (score >= 85) return 'foundational';
  if (score >= 60) return 'major';
  if (score >= 30) return 'moderate';
  return 'minor';
};

const band = computed(() => (props.impactLabel ?? bandFromScore(props.score ?? 0)).toLowerCase());

const impactScoreLabel = computed(() => {
  const labels: Record<string, string> = {
    foundational: 'Foundational',
    major: 'Major',
    moderate: 'Moderate',
    minor: 'Minor',
  };
  return labels[band.value] ?? band.value;
});

const impactDescription = computed(() => getImpactSummaryDescription(props.impactLabel ?? null));
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionImpactScorePill',
};
</script>
