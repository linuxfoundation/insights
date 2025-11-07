<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-for="item in items"
    :key="item.id"
    class="flex items-center p-3 w-full hover:bg-neutral-50 rounded-lg transition-all duration-300 cursor-pointer"
    @click="emit('itemClick', item)"
  >
    <!-- Project info -->
    <div class="flex-1 min-w-0 flex gap-3 items-center">
      <lfx-avatar
        :src="item.logoUrl"
        type="organization"
        :aria-label="item.logoUrl && item.name"
        size="small"
      />
      <p class="text-base leading-5 font-medium text-neutral-900 overflow-hidden overflow-ellipsis">
        {{ item.name }}
      </p>
    </div>
    <!-- Rank -->
    <div class="text-neutral-500 text-sm">#{{ item.rank }}</div>
  </div>

  <div
    v-if="items.length === 0 && isSuccess"
    class="flex flex-col items-center py-20"
  >
    <lfx-icon
      name="face-monocle"
      :size="40"
      class="text-neutral-300"
    />
    <h3 class="text-center pt-5 text-heading-4 sm:text-heading-3 font-secondary font-bold text-neutral-500">
      No projects found
    </h3>
  </div>
  <div
    v-if="isLoading"
    class="flex items-center justify-between h-32 py-1"
  >
    <lfx-spinner
      :size="40"
      class="text-neutral-300"
    />
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import type { Leaderboard } from '~~/types/leaderboard/leaderboard';

defineProps<{
  items: Leaderboard[];
  isSuccess: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'itemClick', item: Leaderboard): void;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardSearchResults',
};
</script>
