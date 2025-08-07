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
    <lfx-copilot-chat-history :messages="messages" />

    <!-- Chat box -->
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { CopilotMessage } from '../types/copilot.types'
import LfxCopilotChatHistory from './copilot-chat-history.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'

const messages = ref<Array<CopilotMessage>>([
  {
    role: 'user',
    parts: [{ type: 'text', text: 'Hello, how are you?' }]
  },
  {
    role: 'assistant',
    parts: [{ type: 'text', text: 'I am fine, thank you!' }]
  },
  {
    role: 'user',
    parts: [{ type: 'text', text: 'What is the capital of France?' }]
  },
  {
    role: 'assistant',
    parts: [{ type: 'text', text: 'The capital of France is Paris.' }]
  }
])
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotSidebar'
}
</script>