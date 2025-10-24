<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div
      class="cursor-pointer flex items-center gap-1 mb-4"
      @click="isReasonExpanded = !isReasonExpanded"
    >
      <lfx-chat-label
        label="Error analysing query"
        :status="message.status"
      />
      <lfx-icon
        :name="isReasonExpanded ? 'angle-up' : 'angle-down'"
        :size="12"
        class="text-negative-600"
      />
    </div>
    <div
      v-if="isReasonExpanded"
      class="mb-4 text-xs text-neutral-500 pl-3 border-l border-neutral-300"
    >
      {{ message.explanation }}
    </div>
    <span class="text-sm text-neutral-900"> There was an error processing your request. Please try again. </span>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { AIMessage } from '../../types/copilot.types';
import LfxChatLabel from './chat-label.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  message: AIMessage;
}>();

const isReasonExpanded = ref(false);
</script>

<script lang="ts">
export default {
  name: 'LfxChatError',
};
</script>
