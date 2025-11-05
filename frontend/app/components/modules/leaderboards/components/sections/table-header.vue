<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-center justify-between w-full text-xs font-semibold text-neutral-400 whitespace-pre-wrap bg-white"
    v-bind="$attrs"
  >
    <div
      v-if="showRank"
      class="w-10 shrink-0"
    >
      #
    </div>
    <div class="flex-1 min-w-0">Project</div>
    <div class="flex-1 min-w-0 text-right flex items-center gap-1.5 justify-end">
      {{ config?.columnLabel }}
      <lfx-tooltip
        v-if="config?.columnTooltip"
        :content="config?.columnTooltip"
      >
        <lfx-icon
          name="info-circle"
          type="light"
          :size="16"
          class="text-neutral-400 cursor-pointer"
        />
      </lfx-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';

withDefaults(
  defineProps<{
    config: LeaderboardConfig;
    showRank?: boolean;
  }>(),
  {
    showRank: true,
  },
);
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetail',
};
</script>
