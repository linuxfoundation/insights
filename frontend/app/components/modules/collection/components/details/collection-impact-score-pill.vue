<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-tooltip placement="top">
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
      <div class="space-y-0.5 text-xs">
        <div class="font-semibold mb-1">Impact Score (0–100)</div>
        <div><span class="font-semibold">Foundational</span> — 85–100</div>
        <div><span class="font-semibold">Major</span> — 60–84</div>
        <div><span class="font-semibold">Moderate</span> — 30–59</div>
        <div><span class="font-semibold">Minor</span> — 0–29</div>
      </div>
    </template>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

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
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionImpactScorePill',
};
</script>
