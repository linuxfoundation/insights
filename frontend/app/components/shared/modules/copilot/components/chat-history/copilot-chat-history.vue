<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="h-full flex flex-col gap-6 chat-messages">
    <lfx-copilot-chat-item
      v-for="(message, index) in messages"
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

const emit = defineEmits<{
  (e: 'selectResult', id: string): void
}>()

const props = defineProps<{
  messages: Array<AIMessage>,
  selectedResultId: string | null,
  isLoading: boolean,
  widgetName: string;
}>()

const allResults = computed(() => props.messages.filter(m => m.type === 'sql-result' || m.type === 'pipe-result'));

const selectResult = (id: string) => {
  emit('selectResult', id)
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotChatHistory'
}
</script>