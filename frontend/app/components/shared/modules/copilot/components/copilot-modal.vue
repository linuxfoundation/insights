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
          @update:data="handleDataUpdate"
          @update:selected-result="handleSelectedResult"
        />
      </div>
      <div class="w-2/3">
        <div
          v-if="selectedResultData && selectedResultData.length > 0"
          class="overflow-x-auto p-6"
        >
          <table class="min-w-full border border-neutral-200 rounded text-xs">
            <thead>
              <tr class="bg-neutral-50">
                <th
                  v-for="(col, colIdx) in Object.keys(selectedResultData[0] || {})"
                  :key="colIdx"
                  class="px-3 py-2 border-b border-neutral-200 text-left font-semibold text-neutral-700"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIdx) in selectedResultData"
                :key="rowIdx"
                class="hover:bg-neutral-50"
              >
                <td
                  v-for="(col, colIdx) in Object.keys(selectedResultData[0] || {})"
                  :key="colIdx"
                  class="px-3 py-2 border-b border-neutral-100"
                >
                  {{ row[col] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="p-6 text-neutral-400 text-sm"
        >
          No data to display.
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MessageData, ResultsHistory } from '../types/copilot.types'
import LfxModal from '~/components/uikit/modal/modal.vue'
import LfxCopilotSidebar from "~/components/shared/modules/copilot/components/copilot-sidebar.vue"

const props = defineProps<{
  modelValue: boolean
  widgetName: string
}>()

const resultData = ref<ResultsHistory[]>([]);
const selectedResultId = ref<string | null>(null);
const selectedResultData = computed(() => {
  return resultData.value.find(result => result.id === selectedResultId.value)?.data;
});

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
}

const handleSelectedResult = (id: string) => {
  selectedResultId.value = id;
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotModal'
}
</script>
