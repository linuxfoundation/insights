<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <div
      class="cursor-pointer flex items-center gap-1"
      @click="isReasonExpanded = !isReasonExpanded"
    >
      <lfx-chat-label 
        v-if="message"
        label="Reasoning" 
        :status="message.status" 
      />
      <lfx-icon
        :name="isReasonExpanded ? 'angle-up' : 'angle-down'"
        :size="12"
      />
    </div>
    <div
      v-if="isReasonExpanded"
      class="my-4 text-xs text-neutral-400"
    >
      {{ reasoning }}
    </div>
    <div class="my-4">{{ message.content }}</div>

    <span 
      class="flex items-center p-3 border border-solid border-neutral-200 
      rounded-xl bg-white justify-between cursor-pointer hover:bg-neutral-50"
      @click="emit('select')"
    >
      <lfx-chat-result-label
        :version="version"
        :label="getTitle(message.id)"
      />
      <lfx-icon
        v-if="!isSelected"
        name="arrow-rotate-left"
        :size="16"
        class="text-neutral-400"
      />
    </span>
    
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { AIMessage } from '../../types/copilot.types'
import LfxChatResultLabel from '../shared/result-label.vue'
import { useCopilotStore } from '../../store/copilot.store';
import LfxChatLabel from './chat-label.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'

const props = defineProps<{
  message: AIMessage,
  version: number,
  isSelected: boolean | undefined
}>()

const { resultData } = storeToRefs(useCopilotStore());

const isReasonExpanded = ref(false);
// TODO: Implement feedback backend

const emit = defineEmits<{
  (e: 'select'): void
}>()

const reasoning = computed(() => {
  return props.message.explanation || props.message.sql;
})

const getTitle = (id: string) => {
  const result = resultData.value.find(r => String(r.id) === String(id));
  return result?.title || 'Loading...';
}
</script>

<script lang="ts">
export default {
  name: 'LfxChatResult'
}
</script>