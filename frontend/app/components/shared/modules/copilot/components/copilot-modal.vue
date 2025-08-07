<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    type="cover"
    :show-close-button="true"
    width="30"
    content-class="!p-0 !overflow-hidden"
  >
    <div class="bg-white flex h-full">
      <div class="w-1/3">
        <lfx-copilot-sidebar />
      </div>
      <div class="w-2/3">
        results here
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LfxModal from '~/components/uikit/modal/modal.vue'
import LfxCopilotSidebar from "~/components/shared/modules/copilot/components/copilot-sidebar.vue"

const props = defineProps<{
  modelValue: boolean
  widgetName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'ask-copilot': [question: string]
}>()

const isModalOpen = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  }
})
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotModal'
}
</script>
