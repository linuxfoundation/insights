<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full h-full min-h-0 flex flex-col">
    <div
      class="py-4 px-6 w-full h-full min-h-0 flex flex-col"
    >
      <div>
        <lfx-copilot-results-header
          v-if="!isEmpty"
          :results="resultsWithData"
          :selected-result-id="selectedId"
          :is-loading="isLoading"
          @update:selected-result="selectedId = $event"
        />
      </div>
      <div 
        v-if="!isLoading"
        class="border border-neutral-200 rounded-lg p-4 w-full h-full min-h-0 flex flex-col"
      >
        <lfx-copilot-results-toggle
          :model-value="selectedTab"
          :data="selectedResultData || []"
          @update:model-value="selectedTab = $event"
        />
        <template v-if="!isEmpty">
          <div
            v-if="selectedTab === 'data'"
            class="w-full h-full min-h-0 flex flex-col overflow-auto"
          >
            <lfx-copilot-table-results
              :data="selectedResultData"
            />
          </div>
          <div
            v-else
            class="w-full h-full min-h-0 flex flex-col overflow-auto"
          >
            <lfx-copilot-chart-results
              :data="selectedResultData"
              :config="selectedResultConfig"
              @update:config="selectedResultConfig = $event"
            />
          </div>
        </template>

        <div
          v-else
          class="flex flex-col items-center justify-center h-[450px]"
        >
          <lfx-icon
            name="eyes"
            :size="40"
            class="text-neutral-300"
          />
          <p class="text-sm text-neutral-500 mt-5">
            No data available
          </p>
        </div>
      </div>
      <div
        v-else
        class="h-full flex flex-col justify-center"
      >
        <lfx-copilot-loading-state />
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ResultsHistory } from '../../types/copilot.types';
import LfxCopilotLoadingState from '../loading-state.vue';
import LfxCopilotTableResults from './table-results.vue';
import LfxCopilotResultsHeader from './results-header.vue';
import LfxCopilotResultsToggle from './results-toggle.vue';
import LfxCopilotChartResults from './chart-results.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { Config } from '~~/lib/chat/chart/types';

const emit = defineEmits<{
  (e: 'update:selectedResult', value: string): void;
}>();

const props = defineProps<{
  results: ResultsHistory[];
  selectedResultId: string | null;
  isLoading: boolean;
}>()

const selectedId = computed<string | null>({
  get: () => props.selectedResultId,
  set: (value) => {
    emit('update:selectedResult', value || '');
  }
})
const selectedTab = ref('chart');
const selectedResultConfig = ref<Config | null>(null);

const resultsWithData = computed(() => {
  return props.results.filter(result => result.data.length > 0);
})

const selectedResultData = computed(() => {
  return props.results.find(result => result.id === selectedId.value)?.data || null;
})

const isEmpty = computed(() => {
  return !props.isLoading && (!selectedResultData.value || selectedResultData.value.length === 0);
})

// Reset selectedResultConfig when selectedResultId changes
watch(() => props.selectedResultId, () => {
  selectedResultConfig.value = null;
  console.log('selectedResultId changed:', props.selectedResultId, selectedResultConfig.value)
});

</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsSection'
}
</script>
