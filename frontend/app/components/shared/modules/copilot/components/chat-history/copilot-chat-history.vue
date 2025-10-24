<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="h-full flex flex-col gap-6 chat-messages">
    <lfx-copilot-chat-item
      v-for="(message, index) in visibleMessages"
      :key="index"
      :message="message"
      :all-results="allResults"
      :selected-result-id="selectedResultId"
      :widget-name="widgetName"
      @select-result="selectResult"
    />

    <div v-if="isLoading">
      <lfx-chat-label
        :status="'thinking'"
        label="Thinking..."
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { AIMessage } from '../../types/copilot.types';
import LfxCopilotChatItem from './copilot-chat-item.vue';
import LfxChatLabel from './chat-label.vue';
import type { Widget } from '~/components/modules/widget/types/widget';

const emit = defineEmits<{
  (e: 'selectResult', id: string): void;
}>();

const props = defineProps<{
  messages: Array<AIMessage>;
  selectedResultId: string | null;
  isLoading: boolean;
  widgetName: Widget | undefined;
}>();

const allResults = computed(() =>
  props.messages.filter((m) => m.type === 'sql-result' || m.type === 'pipe-result'),
);

// Filter out chat-response-id messages - they're only for internal tracking
const visibleMessages = computed(() => props.messages.filter((m) => m.type !== 'chat-response-id'));

const selectResult = (id: string) => {
  emit('selectResult', id);
};
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotChatHistory',
};
</script>
