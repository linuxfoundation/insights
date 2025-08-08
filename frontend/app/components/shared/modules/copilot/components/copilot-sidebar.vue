<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="py-6 px-5 bg-gradient-to-t from-neutral-100 to-white h-full border-r border-neutral-200 flex flex-col">
    <!-- Header -->
    <div class="text-xl font-secondary font-bold leading-7 flex gap-3 text-neutral-900 items-center mb-6 flex-none">
      <lfx-icon
        name="sparkles"
        :size="20"
        class="text-brand-500"
      />
      Data Copilot
    </div>

    <!-- Main content: grows and scrolls -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <!-- Message history -->
      <lfx-copilot-chat-history :messages="formattedMessages" />
    </div>

    <!-- Chat box -->
    <div class="mb-2 flex-none">
      <form @submit="handleSubmit">
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
        <div
          v-if="error"
          class="text-xs text-red-500 mt-1"
        >
          Error: {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { CopilotMessage, AIMessage } from '../types/copilot.types'
import { copilotApiService } from '../store/copilot.api.service'
import LfxCopilotChatHistory from './copilot-chat-history.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import { useProjectStore } from '~/components/modules/project/store/project.store'

// Initialize state
const input = ref('')
const isLoading = ref(false)
const streamingStatus = ref('')
const error = ref('')
const messages = ref<Array<AIMessage>>([])

const { project } = storeToRefs(useProjectStore())

// Generate unique ID for messages
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Convert messages to CopilotMessage format
const formattedMessages = computed<Array<CopilotMessage>>(() => {
  return messages.value.map(message => ({
    role: message.role,
    parts: [{
      type: 'text' as const,
      text: message.content
    }]
  }))
})

// Handle form submission
const handleSubmit = async (e?: Event) => {
  e?.preventDefault()
  
  if (input.value.trim() && !isLoading.value) {
    const userMessage = input.value.trim()
    isLoading.value = true
    streamingStatus.value = 'Analyzing your question...'
    error.value = ''
    
    // Add user message to chat
    const userMessageId = generateId()
    messages.value.push({
      id: userMessageId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    })
    
    input.value = ''
    
    try {
      // Prepare the request body with the correct format
      const requestBody = {
        messages: messages.value.map(m => ({
          role: m.role,
          content: m.content
        })),
        pipe: 'active-contributors', // TODO: make this dynamic
        segmentId: project.value?.id,
        projectName: project.value?.name,
        parameters: {
          startDate: "2024-07-23 23:59:59",
          endDate: "2025-07-23 23:59:59",
          granularity: "monthly",
          project: project.value?.slug
        }
      }
      
      // Send streaming request
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Handle the streaming response
      // await handleStreamingResponse(response)
      await copilotApiService.handleStreamingResponse(response, messages.value, (status) => {
        streamingStatus.value = status;
      }, (message, index) => {
        if (index === -1) {
          messages.value.push(message);
        } else {
          messages.value[index] = message;
        }
        scrollToEnd();
      }, () => {
        isLoading.value = false;
        streamingStatus.value = '';
      });
    } catch (err) {
      console.error('Failed to send message:', err)
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      
      // Add error message as assistant response
      const errorMessageId = generateId()
      messages.value.push({
        id: errorMessageId,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: Date.now()
      })
    } finally {
      isLoading.value = false
      streamingStatus.value = ''
    }
  }
}

const scrollToEnd = () => {
  setTimeout(() => {
    const chatMessages = document.querySelector('.chat-messages > div:last-child');
    chatMessages?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
};
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotSidebar'
}
</script>