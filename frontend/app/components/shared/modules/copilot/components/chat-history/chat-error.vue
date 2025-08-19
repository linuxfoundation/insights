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
        label="Error analysing query"
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
      {{ message.explanation }}
    </div>
    <span class="text-sm text-neutral-900">
      There was an error processing your request. Please try again.
    </span>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { AIMessage } from '../../types/copilot.types'
import LfxChatLabel from './chat-label.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  message: AIMessage
}>()

const isReasonExpanded = ref(false)
</script>

<script lang="ts">
export default {
  name: 'LfxChatError'
}
</script>