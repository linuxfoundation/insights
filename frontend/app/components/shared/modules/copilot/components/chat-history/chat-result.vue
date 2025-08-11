<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <span 
    class="flex items-center px-3 py-2 border border-solid border-neutral-200 
    rounded-xl shadow-sm bg-white justify-between cursor-pointer"
    @click="emit('select')"
  >
    <span class="flex items-center gap-2">
      <span class="rounded-full bg-neutral-200 px-1 py-0.5 text-xs font-semibold text-neutral-600">{{ `V${version}` }}</span>
      Results
    </span>
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
</template>
<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  version: number,
  isSelected: boolean | undefined
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()

</script>

<script lang="ts">
export default {
  name: 'LfxChatResult'
}
</script>