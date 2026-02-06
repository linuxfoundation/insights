<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-70 bg-white rounded-xl shadow-xl overflow-hidden border border-neutral-100">
    <!-- Header with gradient -->
    <div class="p-4 bg-gradient-to-t from-white to-brand-50">
      <div class="flex flex-col gap-3">
        <!-- Badge Image -->
        <img
          :src="badgeImage"
          :alt="badge.config.title"
          class="size-20"
        />

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
            <span
              class="px-1.5 py-0.5 rounded-full text-xs font-semibold text-white"
              :style="tierTagStyle"
            >
              Top {{ tierConfig.max }}%
            </span>
            <span class="px-1.5 py-0.5 rounded-full text-xs font-medium text-neutral-500 border border-neutral-500">
              Rank: #{{ badge.rank }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with buttons -->
    <div class="p-4 flex justify-between gap-2">
      <lfx-button
        type="tertiary"
        button-style="pill"
        size="small"
        class="flex-1 justify-center"
        @click="handleShare"
      >
        <lfx-icon
          name="share-nodes"
          :size="12"
        />
        Share
      </lfx-button>
      <nuxt-link
        :to="{
          name: LfxRoutes.LEADERBOARD,
          params: { key: props.badge.config.leaderboardKey },
        }"
        class="flex-1"
      >
        <lfx-button
          type="transparent"
          button-style="pill"
          size="small"
          class="w-full justify-center"
        >
          Leaderboard
          <lfx-icon
            name="arrow-up-right"
            :size="12"
          />
        </lfx-button>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectBadge } from '../types/badge.types';
import { tierConfigs, getTierTagStyle } from '../config/tiers.config';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { LfxRoutes } from '~/components/shared/types/routes';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const emit = defineEmits<{
  (e: 'share'): void;
}>();

const badgeImage = computed(() => props.badge.config.badgeImages[props.badge.tier]);

const tierConfig = computed(() => tierConfigs[props.badge.tier]);
const tierTagStyle = computed(() => getTierTagStyle(tierConfig.value.color));

const handleShare = () => {
  emit('share');
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesPopover',
};
</script>
