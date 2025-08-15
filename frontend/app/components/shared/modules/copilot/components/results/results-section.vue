<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full h-full min-h-0 flex flex-col bg-gradient-to-t from-neutral-100 to-white">
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
        class="c-card p-4 w-full h-full min-h-0 flex flex-col"
      >
        <lfx-copilot-results-toggle
          :model-value="selectedTab"
          :data="selectedResultData || []"
          @update:model-value="selectedTab = $event"
          @open-snapshot-modal="isSnapshotModalOpen = true"
        />
        <template v-if="!isEmpty">
          <div
            v-if="selectedTab === 'data'"
            class="w-full h-full min-h-0 flex flex-col"
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
              :is-snapshot-modal-open="isSnapshotModalOpen"
              @update:config="handleConfigUpdate"
              @update:is-loading="emit('update:isChartLoading', $event)"
              @update:is-snapshot-modal-open="isSnapshotModalOpen = $event"
            />
          </div>
        </template>

        <div
          v-else
          class="flex flex-col items-center justify-center h-full min-h-0"
        >
          <lfx-copilot-error-state :is-chart-error="false" />
        </div>
      </div>
      <div
        v-else
        class="h-full flex flex-col justify-center min-h-0"
      >
        <lfx-copilot-loading-state />
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ResultsHistory } from '../../types/copilot.types';
import LfxCopilotLoadingState from '../shared/loading-state.vue';
import LfxCopilotErrorState from '../shared/error-state.vue';
import LfxCopilotTableResults from './table-results.vue';
import LfxCopilotResultsHeader from './results-header.vue';
import LfxCopilotResultsToggle from './results-toggle.vue';
import LfxCopilotChartResults from './chart-results.vue';
import type { Config } from '~~/lib/chat/chart/types';

const emit = defineEmits<{
  (e: 'update:selectedResult', value: string): void;
  (e: 'update:config', value: Config | null, id: string): void;
  (e: 'update:isChartLoading', value: boolean): void;
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
const isSnapshotModalOpen = ref(false);
const selectedResultConfig = computed<Config | null>(() => {
  return props.results.find(result => result.id === selectedId.value)?.chartConfig || null;
});

const resultsWithData = computed(() => {
  return props.results.filter(result => result.data.length > 0);
})

const selectedResultData = computed(() => {
  return props.results.find(result => result.id === selectedId.value)?.data || null;
})

const isEmpty = computed(() => {
  return !props.isLoading && (!selectedResultData.value || selectedResultData.value.length === 0);
})

const handleConfigUpdate = (config: Config | null) => {
  if (selectedId.value) {
    emit('update:config', config, selectedId.value);
  }
}

</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsSection'
}
</script>
