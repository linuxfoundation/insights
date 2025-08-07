<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="py-6 px-5 bg-gradient-to-t from-neutral-100 to-white h-full border-r border-neutral-200">
    <div class="text-xl font-secondary font-bold leading-7 flex gap-3 text-neutral-900 items-center mb-6">
      <lfx-icon
        name="sparkles"
        :size="20"
        class="text-brand-500"
      />
      Data Copilot
    </div>

    <!-- Message history -->
    <lfx-copilot-chat-history :messages="formattedMessages" />
    {{ chat.status }}

    <!-- Chat box -->
    <div class="mb-2">
      <textarea
        v-model="input"
        :placeholder="`e.g. What are the top contributors to this project?`"
        class="w-full p-3 bg-neutral-100 rounded-sm text-xs resize-none focus:outline-none"
        rows="2"
        style="word-break: break-word; white-space: pre-wrap;"
        :disabled="isLoading"
        @keydown.enter.prevent="handleSubmit"
      />
      <div
        v-if="isLoading"
        class="text-xs text-neutral-500 mt-1"
      >
        Analyzing your question...
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Chat } from '@ai-sdk/vue'

import { storeToRefs } from 'pinia'
import type { CopilotMessage } from '../types/copilot.types'
import LfxCopilotChatHistory from './copilot-chat-history.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import { useProjectStore } from '~/components/modules/project/store/project.store'

// Initialize input for manual handling
const input = ref('')
const isLoading = ref(false)

const { project } = storeToRefs(useProjectStore())

// Initialize the chat with ai-sdk/vue Chat class
const chat = new Chat({
  onFinish: (message) => {
    console.log('Chat response finished:', message)
    isLoading.value = false
  },
  onError: (error) => {
    console.error('Chat error:', error)
    isLoading.value = false
  }
})

// const { completion, error } = useCompletion({
//   api: '/api/chat/stream'
// });

// Convert ai-sdk messages to CopilotMessage format
const formattedMessages = computed<Array<CopilotMessage>>(() => {
  return chat.messages.map(message => ({
    role: message.role as 'user' | 'assistant',
    parts: message.parts.map(part => {
      if (part.type === 'text') {
        return { type: 'text' as const, text: part.text }
      }
      // Handle other part types by converting to text
      return { type: 'text' as const, text: JSON.stringify(part) }
    })
  }))
})

// Handle form submission  
const handleSubmit = () => {
  if (input.value.trim() && !isLoading.value) {
    isLoading.value = true
    chat.sendMessage(
      { text: input.value },
      {
        body: {
          pipe: 'active-contributors', // TODO: make this dynamic
          segmentId: project.value?.id,
          projectName: project.value?.name,
          parameters: {
            startDate: "2024-07-23 23:59:59",
            endDate: "2025-07-23 23:59:59",
            granularity: "monthly",
            project: project.value?.slug
          }
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    input.value = ''
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotSidebar'
}
</script>