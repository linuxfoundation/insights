<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-popover
      v-if="badge"
      placement="top"
      trigger-event="hover"
    >
      <img
        :src="badgeImage"
        :alt="badge.config.title"
        class="size-13 transition-all cursor-pointer hover:scale-105"
      />
      <template #content>
        <lfx-badges-popover
          :badge="badge"
          @share="openShareModal"
        />
      </template>
    </lfx-popover>

    <!-- Share Modal -->
    <lfx-badges-share-modal
      v-if="badge"
      v-model="isShareModalOpen"
      :badge="badge"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ProjectBadge } from '../types/badge.types';
import LfxBadgesPopover from './badges-popover.vue';
import LfxBadgesShareModal from './share/badges-share-modal.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';

const props = defineProps<{
  badge?: ProjectBadge;
}>();

const isShareModalOpen = ref(false);

const openShareModal = () => {
  isShareModalOpen.value = true;
};

const badgeImage = computed(() => {
  if (!props.badge) return '';
  return props.badge.config.badgeImages[props.badge.tier];
});
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesItem',
};
</script>
