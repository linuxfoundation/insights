<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div v-if="!isEmpty">
    <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pb-2">
      <h2 class="text-heading-3 font-secondary font-bold">Health breakdown</h2>
      <div
        v-if="props.healthScoreV2 !== null"
        class="flex items-center gap-1.5"
      >
        <span
          class="h-2 w-2 rounded-full shrink-0"
          :class="scoreDotColorClass"
        />
        <span class="text-sm font-semibold text-neutral-900">{{ scoreLabel }} ({{ props.healthScoreV2 }}/100)</span>
      </div>
    </div>
    <p class="text-xs text-neutral-500 mb-4">
      Maintainer availability, known risks and supply chain posture, and whether the project is actively developed or
      appropriately stable.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <lfx-health-breakdown-category-card
        name="Maintainer Health"
        icon="people-group"
        :score="props.maintainerHealthScoreV2"
        :max-score="40"
      />
      <lfx-health-breakdown-category-card
        name="Security & Supply Chain"
        icon="lock-keyhole"
        :score="props.securitySupplyChainScoreV2"
        :max-score="35"
      />
      <lfx-health-breakdown-category-card
        name="Development Activity"
        icon="chart-line"
        :score="props.developmentActivityScoreV2"
        :max-score="25"
      />
    </div>

    <p class="text-xs text-neutral-400 mb-4">
      Per-signal detail (e.g. maintainer responsiveness, bus factor) isn't available as individually reported data yet —
      the categories above reflect the full underlying signal set.
    </p>

    <nuxt-link :to="{ name: LfxRoutes.PROJECT_CONTRIBUTORS }">
      <lfx-button
        type="tertiary"
        size="small"
        class="!text-xs"
      >
        View more in Contributors
        <lfx-icon
          name="arrow-up-right"
          :size="12"
        />
      </lfx-button>
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxHealthBreakdownCategoryCard from './health-breakdown/category-card.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';
import { getHealthScoreV2Config } from '~~/config/trust-score';

const props = defineProps<{
  healthScoreV2: number | null;
  healthLabel: string | null;
  maintainerHealthScoreV2: number | null;
  securitySupplyChainScoreV2: number | null;
  developmentActivityScoreV2: number | null;
}>();

const isEmpty = computed(() => props.healthScoreV2 === null);

const scoreLabel = computed(() => getHealthScoreV2Config(props.healthLabel).label);

const scoreDotColorClass = computed(() => {
  const label = props.healthLabel;
  if (label === 'excellent' || label === 'healthy') return 'bg-positive-500';
  if (label === 'fair' || label === 'concerning') return 'bg-warning-500';
  return 'bg-negative-500';
});
</script>

<script lang="ts">
export default {
  name: 'LfxHealthBreakdownSection',
};
</script>
