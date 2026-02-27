<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Title row -->
    <div class="flex items-start gap-3">
      <div class="flex flex-col flex-1 gap-3">
        <!-- Icon -->
        <div class="size-12 rounded-full bg-accent-100 flex items-center justify-center">
          <lfx-icon
            name="rectangle-history-circle-plus"
            :size="24"
            class="col-1 row-1 text-accent-500 m-auto"
          />
        </div>
        <!-- Title and description -->
        <div class="flex flex-col gap-1">
          <h2 class="text-xl font-bold font-secondary leading-7 text-neutral-900">Create collection</h2>
          <p class="text-xs font-normal leading-4 text-neutral-500">
            Create you own collection to organize or showcase open-source projects around a specific theme or purpose.
          </p>
        </div>
      </div>
      <!-- Close button -->
      <lfx-icon-button
        icon="xmark"
        size="small"
        @click="$emit('close')"
      />
    </div>

    <!-- Progress bar -->
    <div class="flex gap-1 w-full">
      <div
        v-for="(_, index) in totalSteps"
        :key="index"
        class="flex-1 h-1 rounded-full transition-all"
        :class="getProgressBarClass(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { createCollectionSteps } from '~/components/modules/collection/config/create-collection.config';

const props = defineProps<{
  step: number;
}>();

defineEmits<{
  close: [];
}>();

const totalSteps = computed(() => createCollectionSteps.length);

const getProgressBarClass = (index: number) => {
  if (index < props.step) {
    return 'bg-accent-500';
  }
  if (index === props.step) {
    return 'bg-accent-300';
  }
  return 'bg-neutral-200';
};
</script>

<script lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';

export default {
  name: 'LfCreateCollectionModalHeader',
  components: {
    LfxIcon,
    LfxIconButton,
  },
};
</script>
