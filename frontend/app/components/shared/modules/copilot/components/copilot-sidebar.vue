<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="py-6 px-0 bg-gradient-to-t from-neutral-100 to-white h-full border-r border-neutral-200 flex flex-col">
    <!-- Header -->
    <div 
      class="px-5 text-xl font-secondary font-bold leading-7 flex gap-3 text-neutral-900 items-center mb-6 flex-none"
    >
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
        :is-loading="isLoading"
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
                  :src="copilotDefaults.project?.logo"
                  class="w-4 h-4"
                  :alt="copilotDefaults.project?.name"
                ></img> 
                {{ copilotDefaults.project?.name }}
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
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { AIMessage, MessageData, MessageRole, MessageStatus } from '../types/copilot.types'
import { copilotApiService } from '../store/copilot.api.service'
// import { tempData } from '../store/copilot.api.service'
import { useCopilotStore } from '../store/copilot.store'
import LfxCopilotChatHistory from './chat-history/copilot-chat-history.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import { lfxWidgets } from '~/components/modules/widget/config/widget.config'
import type {Widget} from "~/components/modules/widget/types/widget";
import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const props = defineProps<{
  widgetName: string;
  selectedResultId: string | null;
}>()

// Initialize state
const input = ref('')
const isLoading = ref(false)
const streamingStatus = ref('')
const error = ref('')
const messages = ref<Array<AIMessage>>([]) // tempData as AIMessage
const selectedResultId = computed<string | null>({
  get: () => props.selectedResultId,
  set: (value) => {
    emit('update:selectedResult', value || '');
  }
})

const widgetDisplayName = computed(() => {
  const widget = lfxWidgets[props.widgetName as Widget];
  return widget?.name || '';
})

const emit = defineEmits<{
  (e: 'update:selectedResult', value: string): void;
  (e: 'update:isLoading', value: boolean): void;
  (e: 'update:error', value: string): void;
  (e: 'update:data', id: string, value: MessageData[]): void;
}>();

const { copilotDefaults } = storeToRefs(useCopilotStore());
const { token } = storeToRefs(useAuthStore());

// Handle form submission
const handleSubmit = async (e?: Event) => {
  e?.preventDefault()
  
  if (input.value.trim() && !isLoading.value) {
    callChatApi(input.value.trim())
  }
}

const callChatApi = async (userMessage: string) => {
  isLoading.value = true
  streamingStatus.value = 'Analyzing your question...'
  error.value = ''
  
  // Add user message to chat
  messages.value.push(
    copilotApiService.generateTextMessage(userMessage, 'user' as MessageRole, 'complete' as MessageStatus)
  )

  scrollToEnd();
  
  input.value = ''
  
  try {
    // TODO: update the params here
    if (copilotDefaults.value.project) {
      const response = await copilotApiService.callChatStream(
        messages.value, 
        copilotDefaults.value.project, 
        copilotDefaults.value.widget, 
        token.value,
        copilotDefaults.value.params)

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
          emit('update:data', message.id, message.data);
          selectedResultId.value = message.id;
        }

        scrollToEnd();
      }, () => {
        isLoading.value = false;
        streamingStatus.value = '';
      });
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    error.value = err instanceof Error ? err.message : 'Failed to send message'
    messages.value.push(
      copilotApiService.generateTextMessage(
        'Sorry, there was an error processing your request.', 
        'assistant' as MessageRole, 
        'error' as MessageStatus)
    )
  } finally {
    isLoading.value = false
    streamingStatus.value = ''
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

// TODO: REMOVE THIS AFTER TESTING
if (messages.value.length > 0) {
  messages.value.forEach((msg) => {
    emit('update:data', msg.id, msg.data || []);
  })
}

watch(copilotDefaults, (newDefaults) => {
  if (newDefaults.question) {
    // TODO: enable this again after testing
    callChatApi(newDefaults.question);
  }
}, { immediate: true });

watch(isLoading, (newVal) => {
  emit('update:isLoading', newVal);
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotSidebar'
}
</script>