<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <lfx-popover
      v-if="badge"
      placement="bottom"
      trigger-event="hover"
    >
      <div
        :class="[
          'size-[52px] rounded-full flex items-center justify-center p-0.5 transition-all cursor-pointer hover:scale-105',
          tierClasses,
        ]"
      >
        <div :class="['size-11 rounded-full flex items-center justify-center', tierBackgroundClasses]">
          <lfx-icon
            :name="badge.config.icon"
            :size="20"
            class="badge-icon"
            :class="tierIconClasses"
          />
        </div>
      </div>
      <template #content>
        <lfx-badges-popover
          :badge="badge"
          @share="openShareModal"
        />
      </template>
    </lfx-popover>
    <div
      v-else
      class="size-[52px] rounded-full flex items-center justify-center p-0.5 bg-transparent"
    >
      <div class="size-11 rounded-full flex items-center justify-center border border-dashed border-neutral-300" />
    </div>

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
import type { ProjectBadge } from '../config/badge.types';
import LfxBadgesPopover from './badges-popover.vue';
import LfxBadgesShareModal from './badges-share-modal.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  badge?: ProjectBadge;
}>();

const isShareModalOpen = ref(false);

const openShareModal = () => {
  isShareModalOpen.value = true;
};

const tierClasses = computed(() => {
  if (!props.badge) return '';

  const classes: Record<string, string> = {
    bronze: 'bg-neutral-200',
    silver: 'bg-neutral-200',
    gold: 'bg-warning-300',
    black: 'bg-neutral-700',
  };

  return classes[props.badge.tier] || '';
});

const tierBackgroundClasses = computed(() => {
  if (!props.badge) return '';

  const classes: Record<string, string> = {
    bronze: 'bg-gradient-to-b from-warning-200 to-warning-100',
    silver: 'bg-gradient-to-b from-neutral-100 to-neutral-50',
    gold: 'bg-gradient-to-b from-warning-300 to-warning-200',
    black: 'bg-gradient-to-b from-neutral-800 to-neutral-700',
  };

  return classes[props.badge.tier] || '';
});

const tierIconClasses = computed(() => {
  if (!props.badge) return '';

  const classes: Record<string, string> = {
    bronze: 'text-warning-700',
    silver: 'text-neutral-500',
    gold: 'text-warning-600',
    black: 'text-neutral-300',
  };

  return classes[props.badge.tier] || '';
});
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesItem',
};
</script>
