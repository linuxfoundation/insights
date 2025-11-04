<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-start w-full pb-4 border-b border-neutral-200 bg-white">
    <div class="flex flex-col gap-3 w-full">
      <!-- Icon and Share button -->
      <div class="flex items-start justify-between w-full">
        <div class="size-12 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
          <lfx-icon
            v-if="config"
            :name="config.icon"
            :size="24"
          />
        </div>
        <lfx-button
          type="tertiary"
          size="small"
          class="h-9 rounded-full"
          @click="handleShare"
        >
          <lfx-icon
            name="share-nodes"
            :size="16"
          />
          Share
        </lfx-button>
      </div>

      <!-- Title, description and search -->
      <div class="h-32 relative w-full">
        <div class="absolute left-0 top-0 w-full flex flex-col gap-1">
          <h1 class="text-3xl leading-11 font-light font-secondary text-neutral-900">
            {{ config?.name }}
          </h1>
          <p class="text-sm leading-5 font-normal text-neutral-500 w-full whitespace-pre-wrap">
            {{ config?.description }}
          </p>
        </div>
        <div class="absolute left-0 top-[92px] w-full">
          <lfx-input
            v-model="searchQuery"
            placeholder="Search projects..."
            class="!bg-neutral-50 !border-neutral-200 !rounded-full h-9"
          >
            <template #prefix>
              <lfx-icon
                name="search"
                type="regular"
                :size="14"
                class="text-neutral-400"
              />
            </template>
          </lfx-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxInput from '~/components/uikit/input/input.vue';

const props = defineProps<{
  config: LeaderboardConfig;
}>();

const searchQuery = ref('');

const handleShare = () => {
  // TODO: Implement share functionality
  if (navigator.share) {
    navigator.share({
      title: props.config?.name,
      text: props.config?.description,
      url: window.location.href,
    });
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetailHeader',
};
</script>
