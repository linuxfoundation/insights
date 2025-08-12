<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full h-full min-h-0 flex flex-col">
    <div
      v-if="isLoading"
      class="flex items-center justify-center h-[240px]"
    >
      <lfx-spinner />
    </div>
    <template v-else>
      <div
        v-if="selectedResultData && selectedResultData.length > 0 && !isLoading"
        class="py-4 px-6 w-full h-full min-h-0 flex flex-col"
      >
        <div>
          <lfx-copilot-results-header
            :results="resultsWithData"
            :selected-result-id="selectedId"
            @update:selected-result="selectedId = $event"
          />
        </div>
        <div class="border border-neutral-200 rounded-lg p-4 w-full h-full min-h-0 flex flex-col">
          <lfx-copilot-results-toggle
            :model-value="selectedTab"
            :data="selectedResultData"
            @update:model-value="selectedTab = $event"
          />
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
            />
          </div>
        </div>
      </div>
      <div
        v-else
        class="flex flex-col items-center justify-center h-[240px]"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ResultsHistory } from '../../types/copilot.types';
import LfxCopilotTableResults from './table-results.vue';
import LfxCopilotResultsHeader from './results-header.vue';
import LfxCopilotResultsToggle from './results-toggle.vue';
import LfxCopilotChartResults from './chart-results.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';

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
const selectedTab = ref('data');

const resultsWithData = computed(() => {
  return props.results.filter(result => result.data.length > 0);
})

const selectedResultData = computed(() => {
  return props.results.find(result => result.id === selectedId.value)?.data || null;
})



</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsSection'
}
</script>
