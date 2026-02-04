<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-[311px] h-[311px] bg-white relative">
    <!-- Project Logo in top-right corner -->
    <div
      class="absolute top-4 right-4 size-20 bg-white border border-neutral-200 rounded-[20px] flex items-center justify-center shadow-xl"
    >
      <lfx-avatar
        :src="project?.logo"
        size="large"
        type="organization"
        class="rounded-2xl"
      />
    </div>

    <!-- Badge image centered -->
    <div class="absolute inset-0 flex items-center justify-center">
      <img
        :src="badgeImage"
        :alt="badge.config.title"
        class="w-64 h-auto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { ProjectBadge } from '../../types/badge.types';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
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
