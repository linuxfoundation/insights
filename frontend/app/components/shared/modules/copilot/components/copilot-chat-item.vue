<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-start gap-3"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[90%] rounded-full break-words"
      :class="[
        message.role === 'user' ? 'bg-neutral-100 text-right' : 'bg-transparent text-left',
        message.type === 'sql-result' ? 'w-full' : ''
      ]"
    >
      <div
        class="text-sm text-neutral-900"
      >
        <span
          v-if="message.type === 'text'"
          class="px-4 py-2 inline-block"
        >{{ message.content }}</span>
        <div
          v-if="message.type === 'router-status'"
          class="flex flex-col gap-3"
        >
          <lfx-chat-label :status="message.status" />
          <span>{{ message.content }}</span>
        </div>
        <lfx-chat-result 
          v-if="message.type === 'sql-result'" 
          :version="resultVersion(message)" 
          :is-selected="message.id === selectedResultId"
          @select="selectResult(message.id)"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AIMessage } from '../types/copilot.types';
import LfxChatLabel from './chat-label.vue'
import LfxChatResult from './chat-result.vue'

const emit = defineEmits<{
  (e: 'selectResult', id: string): void
}>()

const props = defineProps<{
  message: AIMessage,
  allResults: Array<AIMessage>,
  selectedResultId: string
}>()

const resultVersion = (message: AIMessage) => {
  if (message.type === 'sql-result') {
    return props.allResults.findIndex(m => m.id === message.id) + 1;
  }
  return 1;
}

const selectResult = (id: string) => {
  emit('selectResult', id)
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotChatItem'
}
</script>