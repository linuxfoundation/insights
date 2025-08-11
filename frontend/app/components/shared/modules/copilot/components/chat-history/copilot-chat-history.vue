<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="h-full flex flex-col gap-7 chat-messages">
    <lfx-copilot-chat-item
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
      :all-results="allResults"
      :selected-result-id="selectedResultId"
      @select-result="selectResult"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { AIMessage } from '../../types/copilot.types';
import LfxCopilotChatItem from './copilot-chat-item.vue';

const emit = defineEmits<{
  (e: 'selectResult', id: string): void
}>()

const props = defineProps<{
  messages: Array<AIMessage>,
  selectedResultId: string | null
}>()

const allResults = computed(() => props.messages.filter(m => m.type === 'sql-result'));

const selectResult = (id: string) => {
  emit('selectResult', id)
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotChatHistory'
}
</script>