<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col justify-center items-center h-full">
    <lfx-icon
      name="messages"
      :size="64"
      class="text-neutral-300"
      type="light"
    />
    <div class="font-semibold mt-6 mb-2">
      Ask questions about LFX data
    </div>
    <div class="text-neutral-500 text-xs mb-10">
      Start a conversation to generate your first chart
    </div>
    <div class="flex flex-col gap-4 justify-center items-center">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="text-neutral-500 text-xs border border-neutral-200 rounded-full px-2.5 py-1 cursor-pointer"
        @click="emit('suggestionClick', suggestion)"
      >
        {{ suggestion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const emit = defineEmits<{
  (e: 'suggestionClick', suggestion: string): void
}>()
const props = defineProps<{
  projectName: string
}>()

const suggestions = computed(() => [
  'How many new contributors joined last quarter?',
  'When were the peak commit weeks this year?',
  'Are there any critical security issues open?',
  `Is ${props.projectName} gaining or losing momentum?`
])
</script>

<script lang="ts">
export default {
  name: 'LfxEmptyChat'
}
</script>