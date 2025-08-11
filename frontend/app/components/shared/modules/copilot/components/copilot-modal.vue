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
        <lfx-copilot-sidebar
          :widget-name="widgetName"
          :selected-result-id="selectedResultId"
          @update:data="handleDataUpdate"
          @update:selected-result="handleSelectedResult"
          @update:is-loading="handleIsLoading"
        />
      </div>
      <div class="w-2/3">
        <lfx-copilot-results-section
          :results="resultData"
          :selected-result-id="selectedResultId"
          @update:selected-result="handleSelectedResult"
        />
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MessageData, ResultsHistory } from '../types/copilot.types'
import LfxModal from '~/components/uikit/modal/modal.vue'
import LfxCopilotSidebar from "~/components/shared/modules/copilot/components/copilot-sidebar.vue"
import LfxCopilotResultsSection from "~/components/shared/modules/copilot/components/results/results-section.vue"

const props = defineProps<{
  modelValue: boolean
  widgetName: string
}>()

const resultData = ref<ResultsHistory[]>([]);
const selectedResultId = ref<string | null>(null);
const isLoading = ref(false);

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

const handleDataUpdate = (id: string, data: MessageData[]) => {
  resultData.value.push({
    id,
    data
  });

  // TODO: REMOVE THIS AFTER TESTING
  if (selectedResultId.value === null) {
    const withData = resultData.value.find(result => result.data.length > 0);
    selectedResultId.value = withData?.id || null;
  }
}

const handleSelectedResult = (id: string) => {
  selectedResultId.value = id;
}

const handleIsLoading = (value: boolean) => {
  isLoading.value = value;
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotModal'
}
</script>
