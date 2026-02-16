<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-200 rounded-xl p-6 w-[482px] mx-auto">
    <div class="flex flex-col gap-7">
      <div class="flex justify-between items-start">
        <!-- Project Logo & Name -->
        <div class="flex items-center gap-2">
          <lfx-avatar
            :src="project?.logo"
            size="small"
            type="organization"
          />
          <span class="text-sm font-semibold text-black">{{ project?.name }}</span>
        </div>
        <img
          :src="badgeImage"
          :alt="badge.config.title"
          class="size-[120px] shrink-0"
        />
      </div>

      <div class="flex flex-col gap-1 flex-1">
        <!-- Achievement Label -->
        <p class="text-xs font-semibold text-neutral-900">Achievement · {{ formattedDate }}</p>

        <!-- Badge Title & Tags -->
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-2xl leading-9 font-light text-black font-secondary">
            {{ badge.config.title }}
          </h3>
          <div class="flex items-center gap-1 ml-auto">
            <span
              class="px-1.5 py-0.5 rounded-full text-xs font-medium text-neutral-500 border border-neutral-500 leading-none"
            >
              <template v-if="showRankLabel">Rank: </template>#{{ badge.rank }}
            </span>
            <span
              class="px-1.5 py-0.5 rounded-full text-xs font-semibold leading-none text-white"
              :style="tierTagStyle"
            >
              Top {{ tierConfig.max }}%
            </span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-xs text-neutral-600 leading-4">
          {{ project?.name }} is in the top {{ tierConfig.max }}% of open source projects for
          {{ badge.config.description.toLowerCase() }}.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../../types/badge.types';
import { tierConfigs, getTierTagStyle } from '../../config/tiers.config';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const { project } = storeToRefs(useProjectStore());

const formattedDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const badgeImage = computed(() => props.badge.config.badgeImages[props.badge.tier]);
const showRankLabel = computed(
  () => props.badge.config.title.length + String(props.badge.rank).length <= 22 || props.badge.rank < 1000,
);
const tierConfig = computed(() => tierConfigs[props.badge.tier]);
const tierTagStyle = computed(() => getTierTagStyle(tierConfig.value.color));
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesSharePreview',
};
</script>
