<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isOpen"
    width="480px"
    content-class="!p-0 !rounded-xl overflow-hidden"
  >
    <div class="relative">
      <!-- Gradient Background -->
      <div class="absolute top-0 left-0 w-full h-[185px] bg-gradient-to-t from-white to-brand-50" />

      <!-- Close Button -->
      <button
        type="button"
        class="absolute top-6 right-6 z-10 size-7 flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
        @click="close"
      >
        <lfx-icon
          name="xmark"
          :size="16"
          class="text-neutral-900"
        />
      </button>

      <!-- Content -->
      <div class="relative pt-[52px] px-6 pb-6">
        <!-- Preview Card -->
        <lfx-badges-share-preview
          ref="previewRef"
          :badge="badge"
        />

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
            <lfx-badges-share-download
              :badge="badge"
              :preview-ref="previewRef"
            />
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ProjectBadge } from '../config/badge.types';
import LfxBadgesSharePreview from './badges-share-preview.vue';
import LfxBadgesShareDownload from './badges-share-download.vue';
import LfxBadgesShareSocials from './badges-share-socials.vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  modelValue: boolean;
  badge: ProjectBadge;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const previewRef = ref<InstanceType<typeof LfxBadgesSharePreview> | null>(null);

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
