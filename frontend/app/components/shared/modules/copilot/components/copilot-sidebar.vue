<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="py-6 px-0 bg-gradient-to-t from-neutral-100 to-white h-full border-r border-neutral-200 flex flex-col">
    <!-- Header -->
    <div class="px-5 text-xl font-secondary font-bold leading-7 flex gap-3 text-neutral-900 items-center mb-6 flex-none">
      <lfx-icon
        name="sparkles"
        :size="20"
        class="text-brand-500"
      />
      Data Copilot
    </div>

    <!-- Main content: grows and scrolls -->
    <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5">
      <!-- Message history -->
      <lfx-copilot-chat-history 
        :messages="messages" 
        :selected-result-id="selectedResultId" 
        @select-result="selectResult"
      />
    </div>

    <!-- Chat box -->
    <div class="mt-6 flex-none px-5">
      <form @submit="handleSubmit">
        <div class="relative border border-solid border-neutral-200 rounded-xl bg-white">
          <textarea
            v-model="input"
            placeholder="Ask a question..."
            class="w-full p-4 bg-transparent
              text-xs resize-none focus:outline-none"
            rows="2"
            style="word-break: break-word; white-space: pre-wrap;"
            :disabled="isLoading"
            @keydown.enter.prevent="handleSubmit"
          />
          <div class="flex justify-between pb-4 px-4 items-center">
            <div class="flex gap-3 text-sm">
              <span
                class="text-xs text-neutral-500 flex gap-1 items-center bg-brand-100 
                  rounded-full px-2.5 py-1"
              >
                <img
                  :src="project.logo"
                  class="w-4 h-4"
                  :alt="project.name"
                ></img> 
                {{project.name}}
              </span>
              <span
                class="text-xs text-neutral-900 flex gap-1 items-center bg-white 
                  rounded-full px-2.5 py-1 border border-solid border-neutral-200"
              >
                <lfx-icon
                  name="people-group"
                  :size="12"
                />
                {{ widgetDisplayName }}
              </span>
            </div>
            <lfx-icon-button
              :disabled="!input.trim() || isLoading"
              icon="arrow-up"
              size="small"
              type="primary"
              @click="handleSubmit"
            />
          </div>
        </div>
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
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { AIMessage, MessageData } from '../types/copilot.types'
import { copilotApiService } from '../store/copilot.api.service'
import { tempData } from '../store/copilot.api.service'
import LfxCopilotChatHistory from './copilot-chat-history.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import { useProjectStore } from '~/components/modules/project/store/project.store'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import { lfxWidgets } from '~/components/modules/widget/config/widget.config'
import type {Widget} from "~/components/modules/widget/types/widget";

const props = defineProps<{
  widgetName: string
}>()

// Initialize state
const input = ref('')
const isLoading = ref(false)
const streamingStatus = ref('')
const error = ref('')
const messages = ref<Array<AIMessage>>(tempData as AIMessage[]) //
const selectedResultId = ref<string | null>(messages.value[messages.value.length - 1]?.id || null)

const widgetDisplayName = computed(() => {
  const widget = lfxWidgets[props.widgetName as Widget];
  return widget?.name || '';
})

const emit = defineEmits<{
  (e: 'update:input', value: string): void;
  (e: 'update:isLoading', value: boolean): void;
  (e: 'update:streamingStatus', value: string): void;
  (e: 'update:error', value: string): void;
  (e: 'update:messages', value: Array<AIMessage>): void;
  (e: 'update:data', id: string, value: MessageData[]): void;
}>();

const { project } = storeToRefs(useProjectStore())

// Generate unique ID for messages
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

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
      type: 'text',
      status: 'complete',
      content: userMessage,
      timestamp: Date.now()
    })
    
    input.value = ''
    
    try {
      const response = await copilotApiService.callChatStream(messages.value, project.value!, 'active-contributors', {
        startDate: "2024-07-23 23:59:59",
        endDate: "2025-07-23 23:59:59",
        granularity: "monthly",
        project: project.value?.slug || ''
      })

      // Handle the streaming response
      await copilotApiService.handleStreamingResponse(response, messages.value, (status) => {
        streamingStatus.value = status;
      }, (message, index) => {
        if (index === -1) {
          messages.value.push(message);
        } else {
          messages.value[index] = message;
        }

        if (message.data) {
          selectedResultId.value = message.id;
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
        type: 'text',
        status: 'error',
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

const selectResult = (id: string) => {
  selectedResultId.value = id;
}

watch(selectedResultId, (newId) => {
  if (newId) {
    const result = messages.value.find(m => m.id === newId);
    if (result && result.data) {
      emit('update:data', newId, result.data);
    }
  }
}, { immediate: true })
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotSidebar'
}
</script>