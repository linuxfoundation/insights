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
    <div class="bg-white xl:flex hidden h-full">
      <div class="w-1/3">
        <lfx-copilot-sidebar
          :widget-name="widgetName"
          :is-loading="isLoading"
          :is-chart-loading="isChartLoading"
          @update:data="handleDataUpdate"
          @update:is-loading="isLoading = $event"
        />
      </div>
      <div class="w-2/3 flex justify-stretch items-stretch">
        <lfx-copilot-results-section
          :is-loading="isLoading"
          @update:is-chart-loading="isChartLoading = $event"
        />
      </div>
    </div>
    <div class="bg-white xl:hidden flex h-full items-center justify-center">
      <div class="flex flex-col items-center justify-center gap-3">
        <lfx-icon
          name="arrows-left-right-to-line"
          :size="80"
          class="text-neutral-300"
        />
        <div class="text-sm font-semibold text-neutral-900">
          Data Copilot requires a bit more room
        </div>
        <div class="text-xs text-neutral-400">
          Please resize your browser window to explore this feature
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import type { MessageData } from '../types/copilot.types'
import { useCopilotStore } from '../store/copilot.store';
import LfxModal from '~/components/uikit/modal/modal.vue'
import LfxCopilotSidebar from "~/components/shared/modules/copilot/components/copilot-sidebar.vue"
import LfxCopilotResultsSection from "~/components/shared/modules/copilot/components/results/results-section.vue"
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  modelValue: boolean
  widgetName: string
}>()

const { resultData, selectedResultId } = storeToRefs(useCopilotStore());
const { resetResultData } = useCopilotStore();


const isLoading = ref(false);
const isChartLoading = ref(false);

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isModalOpen = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  }
})

const handleDataUpdate = (id: string, data: MessageData[], routerReasoning?: string) => {
  resultData.value.push({
    id,
    data,
    routerReasoning
  });


  if (selectedResultId.value === null) {
    const withData = resultData.value.find(result => result.data.length > 0);
    selectedResultId.value = withData?.id || null;
  }
}

watch(isModalOpen, (value) => {
  if (value) {
    resetResultData();
  }
}, { immediate: true })
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotModal'
}
</script>
