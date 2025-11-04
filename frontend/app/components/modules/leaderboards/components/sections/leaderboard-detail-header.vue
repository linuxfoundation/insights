<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6 items-start w-full pb-4">
    <!-- Icon and Share button -->
    <div
      class="flex justify-between w-full"
      :class="[scrollTop > 50 ? 'items-center' : 'items-start']"
    >
      <div
        class="flex transition-all ease-linear"
        :class="[scrollTop > 50 ? 'flex-row gap-4' : 'flex-col gap-3']"
      >
        <div
          :class="[scrollTop > 50 ? 'size-10' : 'size-12']"
          class="transition-all ease-linear bg-white border border-neutral-200 rounded-lg flex items-center justify-center"
        >
          <lfx-icon
            v-if="config"
            :name="config.icon"
            :size="scrollTop > 50 ? 20 : 24"
          />
        </div>

        <div class="flex flex-col gap-1">
          <h1
            :class="[scrollTop > 50 ? 'text-2xl' : 'text-3xl']"
            class="transition-all ease-linear font-light font-secondary text-neutral-900"
          >
            {{ config?.name }}
          </h1>
          <p
            :class="[scrollTop < 50 ? 'block' : 'hidden']"
            class="transition-all ease-linear text-sm text-neutral-500 w-full whitespace-pre-wrap"
          >
            {{ config?.description }}
          </p>
        </div>
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

    <div class="relative w-full">
      <div class="w-full">
        <div class="rounded-full border border-solid border-neutral-200">
          <lfx-input
            v-model="searchQuery"
            placeholder="Search projects..."
            class="!bg-neutral-50 !border-none !rounded-full h-9 !shadow-none"
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
import { ref, watch } from 'vue';
import type { LeaderboardConfig } from '../../config/types/leaderboard.types';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import useScroll from '~/components/shared/utils/scroll';

const props = defineProps<{
  config: LeaderboardConfig;
}>();

const { scrollTop } = useScroll();

const searchQuery = ref('');
const emit = defineEmits<{
  (e: 'search', query: string): void;
}>();

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

watch(searchQuery, (newVal) => {
  emit('search', newVal);
});
</script>

<script lang="ts">
export default {
  name: 'LfxLeaderboardDetailHeader',
};
</script>
