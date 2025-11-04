<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card>
    <div class="flex flex-col gap-4">
      <div class="size-12 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
        <lfx-icon
          v-if="config"
          :name="config.icon"
          :size="24"
        />
      </div>

      <div class="flex flex-col gap-1">
        <h1 class="text-xl font-light font-secondary text-neutral-900">
          {{ config?.name }}
        </h1>
        <p class="text-sm text-neutral-500 w-full whitespace-pre-wrap">
          {{ config?.description }}
        </p>
      </div>

      <router-link :to="`/leaderboards/${config.key}`">
        <lfx-button
          type="transparent"
          class="mt-6 w-full justify-center"
        >
          View leaderboard
        </lfx-button>
      </router-link>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';

defineProps<{
  config: LeaderboardConfig;
}>();
</script>
<script lang="ts">
export default {
  name: 'LfxLeaderboardCard',
};
</script>
