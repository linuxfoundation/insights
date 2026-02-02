<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-[280px] bg-white rounded-xl shadow-xl overflow-hidden border border-neutral-100">
    <!-- Header with gradient -->
    <div class="p-4 bg-gradient-to-t from-white to-brand-50">
      <div class="flex flex-col gap-5">
        <!-- Badge Icon -->
        <div :class="['size-20 rounded-full flex items-center justify-center', tierRingClasses]">
          <div :class="['size-[72px] rounded-full flex items-center justify-center', tierBackgroundClasses]">
            <lfx-icon
              :name="badge.config.icon"
              :size="32"
              :class="tierIconClasses"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-3">
          <!-- Title & Description -->
          <div class="flex flex-col gap-1">
            <p class="text-base font-bold text-neutral-900">
              {{ badge.config.title }}
            </p>
            <p class="text-xs text-neutral-500 leading-4">
              {{ badge.config.description }}
            </p>
          </div>

          <!-- Tags -->
          <div class="flex items-center gap-2">
            <span :class="['px-1.5 py-0.5 rounded-full text-xs font-semibold', tierTagClasses]">
              Top {{ badge.percentile }}%
            </span>
            <span class="px-1.5 py-0.5 rounded-full text-xs font-medium text-neutral-500 border border-neutral-500">
              Rank: #{{ badge.rank }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with buttons -->
    <div class="p-4 flex gap-2">
      <button
        type="button"
        class="flex-1 h-7 flex items-center justify-center gap-1 px-2 py-1 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
        @click="handleShare"
      >
        <lfx-icon
          name="share-nodes"
          :size="12"
        />
        <span>Share</span>
      </button>
      <nuxt-link
        :to="leaderboardLink"
        class="flex-1 h-7 flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-brand-500 hover:bg-brand-50 transition-colors"
      >
        <lfx-icon
          name="arrow-up-right"
          :size="12"
          class="text-brand-500"
        />
        <span>Leaderboard</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectBadge } from '../config/badge.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const emit = defineEmits<{
  (e: 'share'): void;
}>();

const leaderboardLink = computed(() => ({
  name: LfxRoutes.LEADERBOARD,
  params: { key: props.badge.config.leaderboardKey },
}));

const tierRingClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'border-2 border-dashed border-warning-400',
    silver: 'border-2 border-dashed border-neutral-400',
    gold: 'border-2 border-dashed border-warning-500',
    black: 'border-2 border-dashed border-neutral-600',
  };
  return classes[props.badge.tier] || '';
});

const tierBackgroundClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'bg-gradient-to-b from-warning-200 to-warning-100',
    silver: 'bg-gradient-to-b from-neutral-200 to-neutral-100',
    gold: 'bg-gradient-to-b from-warning-300 to-warning-200',
    black: 'bg-gradient-to-b from-neutral-700 to-neutral-600',
  };
  return classes[props.badge.tier] || '';
});

const tierIconClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'text-warning-700',
    silver: 'text-neutral-500',
    gold: 'text-warning-600',
    black: 'text-neutral-300',
  };
  return classes[props.badge.tier] || '';
});

const tierTagClasses = computed(() => {
  const classes: Record<string, string> = {
    bronze: 'bg-warning-600 text-white',
    silver: 'bg-neutral-500 text-white',
    gold: 'bg-warning-500 text-white',
    black: 'bg-neutral-700 text-white',
  };
  return classes[props.badge.tier] || '';
});

const handleShare = () => {
  emit('share');
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesPopover',
};
</script>
