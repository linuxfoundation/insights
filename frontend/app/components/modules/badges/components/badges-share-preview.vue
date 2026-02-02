<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white border border-neutral-200 rounded-xl p-5 w-[360px] mx-auto">
    <div class="flex items-start justify-between gap-4">
      <!-- Left side: Project info -->
      <div class="flex flex-col gap-4 flex-1">
        <!-- Project Logo & Name -->
        <div class="flex items-center gap-2">
          <lfx-avatar
            :src="project?.logo"
            size="xsmall"
            type="organization"
          />
          <span class="text-[10px] font-semibold text-black">{{ project?.name }}</span>
        </div>

        <!-- Achievement Label -->
        <p class="text-[8px] font-semibold text-brand-500">Achievement · {{ formattedDate }}</p>

        <!-- Badge Title & Tags -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-xl font-light text-black font-secondary">
              {{ badge.config.title }}
            </h3>
            <div class="flex items-center gap-1">
              <span
                class="px-1.5 py-1 rounded-full text-[9px] font-medium text-neutral-500 border border-neutral-500 leading-none"
              >
                Rank: #{{ badge.rank }}
              </span>
              <span :class="['px-1.5 py-1 rounded-full text-[9px] font-semibold leading-none', tierTagClasses]">
                Top {{ badge.percentile }}%
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-[10px] text-neutral-600 leading-[1.25]">
            {{ project?.name }} is in the top {{ badge.percentile }}% of open source projects for
            {{ badge.config.description.toLowerCase() }}
          </p>
        </div>
      </div>

      <!-- Right side: Badge Icon -->
      <div :class="['size-20 rounded-full flex items-center justify-center shrink-0', tierRingClasses]">
        <div :class="['size-[72px] rounded-full flex items-center justify-center', tierBackgroundClasses]">
          <lfx-icon
            :name="badge.config.icon"
            :size="32"
            :class="tierIconClasses"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../config/badge.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
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
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesSharePreview',
};
</script>
