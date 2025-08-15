<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pb-6 px-0 bg-white h-full border-r border-neutral-200 flex flex-col">
    <!-- Header -->
    <div 
      class="px-4 text-xl font-secondary font-bold leading-7 flex gap-3 text-neutral-900 items-center mb-4 flex-none
      h-16 flex items-center"
    >
      <lfx-icon
        name="sparkles"
        :size="20"
        class="text-brand-500"
      />
      Data Copilot
    </div>

    <!-- Main content: grows and scrolls -->
    <div
      ref="scrollable"
      class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 relative"
      @scroll="handleScroll"
    >
      <!-- Top gradient -->
      <div
        v-show="showTopGradient"
        class="pointer-events-none sticky left-0 right-0 top-0 h-8 z-10"
        style="background: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0));"
      />
      <!-- Bottom gradient -->
      <div
        v-show="showBottomGradient"
        class="pointer-events-none sticky left-0 right-0 h-8 z-10"
        style="background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
        top: calc(100% - 32px);"
      />
      <!-- Message history -->
      <lfx-copilot-chat-history 
        :messages="messages" 
        :selected-result-id="selectedResultId" 
        :is-loading="isLoading"
        :widget-name="widgetName"
        @select-result="selectResult"
      />
    </div>

    <!-- Chat box -->
    <div class="flex-none px-5">
      <form @submit="handleSubmit">
        <div class="relative border border-solid border-neutral-200 rounded-xl bg-white">
          <textarea
            v-model="input"
            placeholder="Ask a question..."
            class="w-full p-4 bg-transparent
              text-xs resize-none focus:outline-none"
            rows="2"
            style="word-break: break-word; white-space: pre-wrap;"
            :disabled="isLoading || isChartLoading"
            @keydown.enter.prevent="handleSubmit"
          />
          <div class="flex justify-between pb-4 px-4 items-center">
            <div class="flex gap-3 text-sm">
              <span
                class="text-xs text-neutral-900 flex gap-1 items-center bg-brand-100 
                  rounded-full px-2.5 py-1"
              >
                <img
                  :src="copilotDefaults.project?.logo"
                  class="w-4 h-4"
                  :alt="copilotDefaults.project?.name"
                ></img> 
                {{ copilotDefaults.project?.name }}
              </span>
              <lfx-context-display
                :widget-name="widgetName"
                type="transparent"
              />
            </div>
            <lfx-icon-button
              :disabled="!input.trim() || isLoading || isChartLoading"
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
import { tempData } from '../store/copilot.api.service'
import { useCopilotStore } from '../store/copilot.store'
import LfxCopilotChatHistory from './chat-history/copilot-chat-history.vue'
import LfxContextDisplay from './shared/context-display.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import { useAuthStore } from '~/components/modules/auth/store/auth.store';

const props = defineProps<{
  widgetName: string;
  selectedResultId: string | null;
  isLoading: boolean;
  isChartLoading: boolean;
}>()

const scrollable = ref<HTMLElement | null>(null)
const showTopGradient = ref(false)
const showBottomGradient = ref(false)

// Initialize state
const input = ref('')
const streamingStatus = ref('')
const error = ref('')
const messages = ref<Array<AIMessage>>(tempData as AIMessage[])
const selectedResultId = computed<string | null>({
  get: () => props.selectedResultId,
  set: (value) => {
    emit('update:selectedResult', value || '');
  }
})

const isLoading = computed<boolean>({
  get: () => props.isLoading,
  set: (value) => {
    emit('update:isLoading', value);
  }
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
  
  input.value = '';
  scrollToEnd();
  
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
  }, 200);
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
    // callChatApi(newDefaults.question);
  }
}, { immediate: true });

watch(messages, () => {
  scrollToEnd();
}, { immediate: true, deep: true });

const handleScroll = () => {
  if (scrollable.value) {
    const { scrollTop, scrollHeight, clientHeight } = scrollable.value
    showTopGradient.value = scrollTop > 10
    showBottomGradient.value = scrollTop + clientHeight < scrollHeight - 10
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotSidebar'
}
</script>