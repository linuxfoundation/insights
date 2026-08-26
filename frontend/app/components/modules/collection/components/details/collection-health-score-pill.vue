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
      <span class="text-xs font-medium text-neutral-500">({{ props.score }})</span>
    </lfx-chip>

    <template #content>
      <div class="w-64 space-y-3 text-xs bg-white border border-neutral-100 rounded-xl shadow-xl p-3">
        <div class="flex items-center gap-1.5">
          <span
            class="size-2 rounded-full shrink-0"
            :class="healthScoreDotClass"
          />
          <span class="font-semibold text-neutral-900">{{ healthScoreLabel }}</span>
          <span class="text-neutral-500">({{ props.score }}/100)</span>
        </div>
        <lfx-progress-bar
          :values="[props.score]"
          :color="progressBarColor"
          size="small"
        />
        <p
          v-if="healthScoreDescription"
          class="text-neutral-500"
        >
          {{ healthScoreDescription }}
        </p>
        <div class="space-y-1.5 pt-1 border-t border-neutral-100">
          <div
            v-for="category in categories"
            :key="category.key"
            class="flex items-center gap-1.5"
          >
            <lfx-icon
              :name="category.icon"
              :size="11"
              class="text-neutral-400 shrink-0"
            />
            <span class="text-neutral-500">{{ category.name }}</span>
            <span class="ml-auto font-medium text-neutral-900">{{ category.display }}</span>
          </div>
        </div>
      </div>
    </template>
  </lfx-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProgressBar from '~/components/uikit/progress-bar/progress-bar.vue';
import { getHealthScoreDescription } from '~~/config/health-breakdown-templates';

const props = defineProps<{
  score: number;
  healthLabel?: string | null;
  unavailable?: boolean;
  maintainerHealthScoreV2?: number | null;
  securitySupplyChainScoreV2?: number | null;
  developmentActivityScoreV2?: number | null;
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

const progressBarColor = computed(() => {
  if (band.value === 'excellent' || band.value === 'healthy') return 'positive';
  if (band.value === 'fair' || band.value === 'concerning') return 'warning';
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
    display: `${props.maintainerHealthScoreV2 ?? '-'}/40`,
  },
  {
    key: 'security-supply-chain',
    name: 'Security & Supply Chain',
    icon: 'shield-check',
    display: `${props.securitySupplyChainScoreV2 ?? '-'}/35`,
  },
  {
    key: 'development-activity',
    name: 'Development Activity',
    icon: 'laptop-code',
    display: `${props.developmentActivityScoreV2 ?? '-'}/25`,
  },
]);
</script>

<script lang="ts">
export default {
  name: 'LfxCollectionHealthScorePill',
};
</script>
