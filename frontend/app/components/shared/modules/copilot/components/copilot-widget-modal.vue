<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    type="floating"
    :show-close-button="true"
    width="30"
    content-class="!p-0 !overflow-hidden"
  >
    <div class="bg-white">
      <!-- Header with widget info -->
      <div class="p-2 flex">
        <div class="flex items-center gap-1 bg-neutral-600 px-3 py-1 rounded-full">
          <lfx-icon
            :name="widgetConfig.copilot?.icon || 'users'"
            :size="12"
            class="text-white"
          />
          <span class="text-xs font-semibold text-white">{{ widgetTitle }}</span>
        </div>
      </div>

      <!-- Main content -->
      <div class="px-2 pb-2 xl:w-[30rem] w-96">
        <!-- Input field -->
        <div class="mb-2">
          <textarea
            v-model="userQuestion"
            :placeholder="`e.g. ${widgetConfig.copilot?.suggestions}`"
            class="w-full p-3 bg-neutral-100 rounded-sm text-xs resize-none focus:outline-none"
            rows="2"
            style="word-break: break-word; white-space: pre-wrap;"
            @keydown.enter="handleAskCopilot"
          />
        </div>

        <!-- Suggestions section -->
        <div class="flex justify-between">
          <div class="flex items-center gap-1">
            <lfx-icon
              name="lightbulb"
              :size="12"
              class="text-neutral-500"
            />
            <span class="text-xs font-medium text-neutral-500">Suggestions</span>
          </div>

          <!-- Ask Copilot button -->
          <div class="flex justify-end">
            <lfx-button
              :disabled="!userQuestion.trim()"
              type="primary"
              size="medium"
              icon="fa fa-sparkles"
              label="Ask Copilot"
              @click="handleAskCopilot"
            />
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LfxModal from '~/components/uikit/modal/modal.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import {lfxWidgets} from "~/components/modules/widget/config/widget.config"
import type {Widget} from "~/components/modules/widget/types/widget"

const props = defineProps<{
  modelValue: boolean
  widgetName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'ask-copilot': [question: string]
}>()

const userQuestion = ref('')

const isModalOpen = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  }
})

const widgetConfig = computed(() => lfxWidgets[props.widgetName as Widget])
const widgetTitle = computed(() => widgetConfig.value?.name || 'Widget')

const handleAskCopilot = () => {
  if (userQuestion.value.trim()) {
    emit('ask-copilot', userQuestion.value.trim())
    // Close modal after asking
    isModalOpen.value = false
    // Reset input
    userQuestion.value = ''
  }
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotWidgetModal'
}
</script>
