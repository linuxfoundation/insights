<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div
      v-if="shouldShowReasoning"
      class="cursor-pointer flex items-center gap-1"
      @click="isReasonExpanded = !isReasonExpanded"
    >
      <lfx-chat-label
        v-if="message"
        label="Reasoning"
        :status="message.status"
      />
      <lfx-icon
        :name="isReasonExpanded ? 'angle-up' : 'angle-down'"
        :size="12"
      />
    </div>
    <div
      v-if="isReasonExpanded && shouldShowReasoning"
      class="my-4 text-xs text-neutral-400"
    >
      {{ reasoning }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AIMessage } from '../../types/copilot.types';
import LfxChatLabel from './chat-label.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  message: AIMessage;
  version: number;
  isSelected: boolean | undefined;
}>();

const isReasonExpanded = ref(false);

const shouldShowReasoning = computed(() => {
  return props.message.type === 'router-status';
});

const reasoning = computed(() => {
  return props.message.reformulatedQuestion || props.message.explanation || props.message.sql;
});
</script>

<script lang="ts">
export default {
  name: 'LfxChatResult',
};
</script>
