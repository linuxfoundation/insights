<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex items-start gap-3"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-3/4 px-4 py-2 rounded-full"
      :class="message.role === 'user' ? 'bg-neutral-100 text-right' : 'bg-transparent text-left'"
    >
      <div
        v-for="(part, index) in message.parts"
        :key="index"
        class="text-sm text-neutral-900"
      >
        <span v-if="part.type === 'text'">{{ part.text }}</span>
        <img
          v-else-if="part.type === 'image' && part.image"
          :src="part.image"
          alt="Message image"
          class="max-w-full h-auto rounded"
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CopilotMessage } from '../types/copilot.types';

defineProps<{
  message: CopilotMessage
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotChatItem'
}
</script>