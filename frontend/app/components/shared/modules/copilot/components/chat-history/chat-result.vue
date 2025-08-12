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
      {{ message.sql }}
    </div>
    <div class="my-4">{{ message.content }}</div>

    <span 
      class="flex items-center px-3 py-2 border border-solid border-neutral-200 
      rounded-xl shadow-sm bg-white justify-between cursor-pointer"
      @click="emit('select')"
    >
      <lfx-chat-result-label
        :version="version"
        label="Results"
      />
      <lfx-icon
        v-if="!isSelected"
        name="arrow-rotate-left"
        :size="16"
        class="text-neutral-400"
      />
    </span>
    <div class="flex gap-2 mt-3">
      <lfx-icon
        name="thumbs-up"
        :size="16"
        class="text-neutral-400 cursor-pointer"
      />
      <lfx-icon
        name="thumbs-down"
        :size="16"
        class="text-neutral-400 cursor-pointer"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AIMessage } from '../../types/copilot.types'
import LfxChatLabel from './chat-label.vue'
import LfxChatResultLabel from './result-label.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  message: AIMessage,
  version: number,
  isSelected: boolean | undefined
}>()

const isReasonExpanded = ref(false);
const emit = defineEmits<{
  (e: 'select'): void
}>()

</script>

<script lang="ts">
export default {
  name: 'LfxChatResult'
}
</script>