<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="size-[600px] bg-white relative">
    <!-- Badge image centered -->
    <div class="absolute inset-0 flex items-center justify-center">
      <img
        :src="badgeImage"
        :alt="badge.config.title"
        class="w-full h-full"
      />
    </div>
    <!-- Project Logo in top-right corner -->
    <div
      class="absolute top-0 right-10 size-[140px] bg-white border border-neutral-200 rounded-[20px] flex items-center justify-center"
    >
      <img
        :src="project?.logo"
        class="size-25"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../../types/badge.types';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';

const props = defineProps<{
  badge: ProjectBadge;
}>();

const { project } = storeToRefs(useProjectStore());

const badgeImage = computed(() => props.badge.config.badgeImages[props.badge.tier]);
</script>

<script lang="ts">
export default {
  name: 'LfxBadgeDownloadPreview',
};
</script>
