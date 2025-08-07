<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="overflow-y-auto flex flex-col gap-7">
    <lfx-copilot-chat-item
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
    />
  </div>
</template>
<script setup lang="ts">
import type { CopilotMessage } from '../types/copilot.types';
import LfxCopilotChatItem from './copilot-chat-item.vue';

// TODO: Change these types to use the types from the API https://ai-sdk.dev/docs/getting-started/nuxt
defineProps<{
  messages: Array<CopilotMessage>
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotChatHistory'
}
</script>