<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-chip
    v-if="props.score === null || props.score === undefined"
    type="bordered"
    size="small"
  >
    <span class="text-xs font-medium text-neutral-500">N/A</span>
  </lfx-chip>
  <lfx-tooltip
    v-else
    placement="top"
    content="Tooltip copy pending"
  >
    <lfx-chip
      type="bordered"
      size="small"
      class="flex items-center gap-1"
    >
      <span
        class="size-1.5 rounded-full shrink-0"
        :class="impactScoreDotClass"
      />
      <span class="text-xs font-medium text-neutral-900">{{ impactScoreLabel }}</span>
      <span class="text-xs font-medium text-neutral-500">({{ props.score }})</span>
    </lfx-chip>
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

const impactScoreDotClass = computed(() => {
  const classes: Record<string, string> = {
    foundational: 'bg-impact-foundational',
    major: 'bg-impact-major',
    moderate: 'bg-impact-moderate',
    minor: 'bg-impact-minor',
  };
  return classes[band.value] ?? 'bg-impact-minor';
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionImpactScorePill',
};
</script>
