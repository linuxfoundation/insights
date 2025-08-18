<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>

  <div
    class="flex flex-col items-start gap-2"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      v-if="message.role === 'user'"
      class="flex justify-end w-full"
    >
      <lfx-context-display
        :widget-name="widgetName"
        type="solid"
      />
    </div>
    <div
      class="rounded-full break-words"
      :class="[
        message.role === 'user' ? 'bg-neutral-100 text-right ml-16' : 'bg-transparent text-left',
        message.type === 'sql-result' || message.type === 'pipe-result' ? 'w-full' : ''
      ]"
    >
      <div
        class="text-sm text-neutral-900"
      >
        <span
          v-if="message.type === 'text'"
          class="px-4 py-3 inline-block"
        >{{ message.content }}</span>
        <div
          v-if="message.type === 'router-status'"
          class="flex flex-col gap-3"
        >
          <lfx-chat-error
            v-if="message.status === 'error'"
            :message="message"
          />
          <span v-else>{{ message.content }}</span>
        </div>
        <lfx-chat-result 
          v-if="message.type === 'sql-result' || message.type === 'pipe-result'" 
          :message="message"
          :version="resultVersion(message)" 
          :is-selected="!!(selectedResultId && message.id === selectedResultId)"
          @select="selectResult(message.id)"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AIMessage } from '../../types/copilot.types';
import LfxContextDisplay from '../shared/context-display.vue';
import LfxChatResult from './chat-result.vue'
import LfxChatError from './chat-error.vue'

const emit = defineEmits<{
  (e: 'selectResult', id: string): void
}>()

const props = defineProps<{
  message: AIMessage,
  allResults: Array<AIMessage>,
  selectedResultId: string | null,
  widgetName: string;
}>()

const resultVersion = (message: AIMessage) => {
  if (message.type === 'sql-result' || message.type === 'pipe-result') {
    const idx = props.allResults.findIndex(m => m.id === message.id);
    return idx === -1 ? 1 : idx + 1;
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