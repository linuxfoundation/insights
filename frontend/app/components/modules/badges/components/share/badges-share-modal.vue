<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isOpen"
    width="600px"
    content-class="!p-0 !rounded-xl overflow-hidden"
  >
    <div class="relative">
      <!-- Gradient Background -->
      <div class="absolute top-0 left-0 w-full h-[185px] bg-gradient-to-t from-white to-brand-50" />

      <!-- Close Button -->
      <lfx-icon-button
        icon="xmark"
        size="small"
        class="absolute top-6 right-6 z-10"
        @click="close"
      />

      <!-- Content -->
      <div class="relative pt-[52px] px-6 pb-6">
        <!-- Preview Card -->
        <lfx-badges-share-preview :badge="badge" />

        <!-- Share Section -->
        <div class="mt-8 flex flex-col gap-5">
          <!-- Share Label -->
          <div class="flex items-center gap-4">
            <span class="text-xs text-neutral-600">Share</span>
            <div class="flex-1 h-px bg-neutral-200" />
          </div>

          <!-- Share Actions -->
          <div class="flex items-center justify-between">
            <!-- Social Icons -->
            <lfx-badges-share-socials :badge="badge" />

            <!-- Download Dropdown -->
            <lfx-badges-share-download :badge="badge" />
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectBadge } from '../../types/badge.types';
import LfxBadgesSharePreview from './badges-share-preview.vue';
import LfxBadgesShareDownload from './badges-share-download.vue';
import LfxBadgesShareSocials from './badges-share-socials.vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';

const props = defineProps<{
  modelValue: boolean;
  badge: ProjectBadge;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const close = () => {
  isOpen.value = false;
};
</script>

<script lang="ts">
export default {
  name: 'LfxBadgesShareModal',
};
</script>
