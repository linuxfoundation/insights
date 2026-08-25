<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-chip
    v-if="props.unavailable"
    type="bordered"
    size="small"
  >
    <span class="text-xs font-medium text-neutral-500">Unavailable</span>
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
        :class="healthScoreDotClass"
      />
      <span class="text-xs font-medium text-neutral-900">{{ healthScoreLabel }}</span>
      <span class="text-xs font-medium text-neutral-500">({{ props.score }})</span>
    </lfx-chip>
  </lfx-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

const props = defineProps<{
  score: number;
  healthLabel?: string | null;
  unavailable?: boolean;
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

const healthScoreLabel = computed(() => {
  const labels: Record<string, string> = {
    excellent: 'Excellent',
    healthy: 'Healthy',
    fair: 'Fair',
    concerning: 'Concerning',
    critical: 'Critical',
  };
  return labels[band.value] ?? band.value;
});

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
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHealthScorePill',
};
</script>
