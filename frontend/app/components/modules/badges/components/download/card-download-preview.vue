<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="w-[1000px] h-[680px] bg-white border border-neutral-200 rounded-[32px] p-12 flex flex-col justify-between"
  >
    <!-- Header: Project info + Badge -->
    <div class="flex justify-between items-start">
      <!-- Project Logo & Name -->
      <div class="flex items-center gap-4">
        <img
          :src="project?.logo"
          :alt="project?.name"
          class="size-14 shrink-0 rounded-[12px] border border-neutral-200 object-cover"
        />
        <span class="text-2xl font-semibold text-black">{{ project?.name }}</span>
      </div>

      <!-- Badge Image -->
      <img
        :src="badgeImage"
        :alt="badge.config.title"
        class="w-[240px] shrink-0"
      />
    </div>

    <!-- Bottom Section: Content + Divider + Footer -->
    <div class="flex flex-col gap-8">
      <!-- Text Section -->
      <div class="flex flex-col gap-2">
        <!-- Achievement Label -->
        <p class="text-2xl font-medium text-neutral-900">Achievement · {{ formattedDate }}</p>

        <!-- Badge Title & Tags -->
        <div class="flex items-center gap-[37px]">
          <h3 class="text-[60px] font-light text-black font-secondary leading-[90px]">
            {{ badge.config.title }}
          </h3>
          <div class="flex items-center gap-3 flex-1 justify-end">
            <span
              class="px-3 py-1 rounded-full text-2xl font-medium text-neutral-500 border border-neutral-500 leading-[36px] whitespace-nowrap"
            >
              Rank: #{{ badge.rank }}
            </span>
            <span
              class="px-3 py-1 rounded-full text-2xl font-semibold leading-[36px] text-white whitespace-nowrap"
              :style="tierTagStyle"
            >
              Top {{ tierConfig.max }}%
            </span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-2xl font-normal text-neutral-600 leading-[36px]">
          {{ project?.name }} is in the top {{ tierConfig.max }}% of open source projects based on
          {{ badge.config.description.toLowerCase() }}
        </p>
      </div>

      <!-- Divider -->
      <div class="border-t border-neutral-200" />

      <!-- LFX Insights branding -->
      <img
        src="/images/og-image/lfx-insights-logo.png"
        alt="LFX Insights"
        class="h-[38px] w-fit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../../types/badge.types';
import { tierConfigs, getTierTagStyle } from '../../config/tiers.config';
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
const tierTagStyle = computed(() => getTierTagStyle(tierConfig.value.color));
</script>

<script lang="ts">
export default {
  name: 'LfxCardDownloadPreview',
};
</script>
