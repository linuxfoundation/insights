<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-4">
      <router-link
        v-for="config in allLeaderboards"
        :key="config.key"
        :to="`/leaderboards/${config.key}`"
        class="flex gap-2 items-center text-xs leading-4 cursor-pointer transition-colors hover:text-neutral-900 hover:font-medium"
        :class="isActiveLeaderboard(config.key) ? 'text-neutral-900 font-medium' : 'text-neutral-500 font-normal'"
      >
        <lfx-icon
          :name="config.icon"
          :size="14"
        />
        <span>{{ config.name }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import leaderboardConfigs from '../../config/index.config';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  leaderboardKey: string;
}>();

const allLeaderboards = computed(() => leaderboardConfigs);

const isActiveLeaderboard = (key: string) => {
  return props.leaderboardKey === key;
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardSidebar',
};
</script>
