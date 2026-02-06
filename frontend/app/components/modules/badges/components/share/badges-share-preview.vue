<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-200 rounded-xl p-5 w-90 mx-auto">
    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-start">
        <!-- Project Logo & Name -->
        <div class="flex items-center gap-2">
          <lfx-avatar
            :src="project?.logo"
            size="small"
            type="organization"
          />
          <span class="text-xxs font-semibold text-black">{{ project?.name }}</span>
        </div>
        <img
          :src="badgeImage"
          :alt="badge.config.title"
          class="size-20 shrink-0"
        />
      </div>

      <div class="flex flex-col gap-2 flex-1">
        <!-- Achievement Label -->
        <p class="text-xxxs font-semibold text-neutral-900">Achievement · {{ formattedDate }}</p>

        <!-- Badge Title & Tags -->
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-xl font-light text-black font-secondary">
            {{ badge.config.title }}
          </h3>
          <div class="flex items-center gap-1 ml-auto">
            <span
              class="px-1.5 py-1 rounded-full text-[9px] font-medium text-neutral-500 border border-neutral-500 leading-none"
            >
              #{{ badge.rank }}
            </span>
            <span
              class="px-1.5 py-1 rounded-full text-[9px] font-semibold leading-none text-white"
              :style="tierTagStyle"
            >
              Top {{ tierConfig.max }}%
            </span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-xxs text-neutral-600 leading-[1.25]">
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
import { tierConfigs } from '../../config/tiers.config';
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
const tierConfig = computed(() => tierConfigs[props.badge.tier]);
const tierTagStyle = computed(() => ({
  background: `linear-gradient(to bottom, ${tierConfig.value.gradient.from}, ${tierConfig.value.gradient.to})`,
}));
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesSharePreview',
};
</script>
