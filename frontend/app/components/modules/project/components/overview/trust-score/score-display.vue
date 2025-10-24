<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex text-3xl font-bold cursor-default">
    <div
      v-if="scoreConfig.label === 'Unavailable'"
      class="flex items-center gap-3"
      :class="props.hideOverallScore ? 'text-neutral-300' : ''"
    >
      <div
        v-if="scoreConfig.color"
        class="h-3 w-3 rounded-full mr-1 bg-positive-500"
        :class="scoreConfig.color"
      />
      {{ scoreConfig.label }}
    </div>
    <lfx-tooltip
      v-else
      placement="top"
    >
      <div
        class="flex items-center gap-3"
        :class="props.hideOverallScore ? 'text-neutral-300' : ''"
      >
        <div
          v-if="scoreConfig.color"
          class="h-3 w-3 rounded-full mr-1"
          :class="scoreConfig.color"
        />
        {{ scoreConfig.label }}
      </div>
      <template #content>
        <div class="text-xs flex gap-1">
          <span class="font-bold">Health score: </span>
          <span>{{ overallScore }}/100 points</span>
        </div>
      </template>
    </lfx-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import { lfxTrustScore } from '~~/config/trust-score';

const props = defineProps<{
  overallScore: number;
  hideOverallScore?: boolean;
}>();

const scoreConfig = computed(() => {
  if (props.hideOverallScore) {
    return { label: 'Unavailable', color: '' };
  }
  return (
    lfxTrustScore.find(
      (s) => props.overallScore <= s.maxScore && props.overallScore >= s.minScore,
    ) || {
      label: 'Critical',
      color: 'bg-negative-500',
    }
  );
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreDisplay',
};
</script>
