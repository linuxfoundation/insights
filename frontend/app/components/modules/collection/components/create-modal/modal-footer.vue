<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex items-center justify-between">
    <!-- Previous button -->
    <lfx-button
      v-if="step > 0"
      type="tertiary"
      button-style="pill"
      @click="$emit('previous')"
    >
      <lfx-icon name="arrow-left" />
      Previous
    </lfx-button>
    <div
      v-else
      class="flex-grow"
    />

    <!-- Right buttons -->
    <div class="flex items-center gap-4">
      <lfx-button
        type="tertiary"
        button-style="pill"
        @click="$emit('cancel')"
      >
        Cancel
      </lfx-button>
      <lfx-button
        v-if="!isLastStep"
        button-style="pill"
        :disabled="!canProceed"
        @click="$emit('next')"
      >
        Next
        <lfx-icon name="arrow-right" />
      </lfx-button>
      <lfx-button
        v-else
        button-style="pill"
        :disabled="!canProceed"
        @click="$emit('submit')"
      >
        Create collection
      </lfx-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import { createCollectionSteps } from '~/components/modules/collection/config/create-collection.config';

const props = defineProps<{
  step: number;
  canProceed: boolean;
}>();

defineEmits<{
  previous: [];
  next: [];
  cancel: [];
  submit: [];
}>();

const totalSteps = computed(() => createCollectionSteps.length);
const isLastStep = computed(() => props.step >= totalSteps.value - 1);
</script>

<script lang="ts">
export default {
  name: 'LfCreateCollectionModalFooter',
};
</script>
