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
    <span class="text-xs font-medium text-neutral-500">({{ props.score }})</span>
  </lfx-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChip from '~/components/uikit/chip/chip.vue';

const props = defineProps<{
  score: number;
  unavailable?: boolean;
}>();

// Mirrors the dot+label+score thresholds/colors in collection-metrics-row.vue, scoped to the
// collection project table's Health Score column (a bordered table-cell pill instead of a
// labeled metrics chip). Duplicated rather than shared: only two call sites (row/card) and the
// logic is ~10 lines, so a composable would be more ceremony than the duplication it avoids.
// health-score.vue itself is intentionally left untouched (used elsewhere in the app).
const healthScoreLabel = computed(() => {
  const score = props.score;
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Healthy';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Concerning';
  return 'Critical';
});

const healthScoreDotClass = computed(() => {
  const score = props.score;
  if (score >= 60) return 'bg-health-healthy';
  if (score >= 20) return 'bg-health-concerning';
  return 'bg-health-critical';
});
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHealthScorePill',
};
</script>
