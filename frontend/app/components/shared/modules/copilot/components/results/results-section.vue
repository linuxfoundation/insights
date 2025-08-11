<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="overflow-auto w-full">
    <div
      v-if="selectedResultData && selectedResultData.length > 0"
      class="overflow-x-auto p-4"
    >
      <div>
        <lfx-copilot-results-header
          :results="resultsWithData"
          :selected-result-id="selectedId"
          @update:selected-result="selectedId = $event"
        />
      </div>
      <div>
        <lfx-copilot-table-results
          :data="selectedResultData"
        />
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ResultsHistory } from '../../types/copilot.types';
import LfxCopilotTableResults from './table-results.vue';
import LfxCopilotResultsHeader from './results-header.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const emit = defineEmits<{
  (e: 'update:selectedResult', value: string): void;
}>();

const props = defineProps<{
  results: ResultsHistory[];
  selectedResultId: string | null;
}>()

const selectedId = computed<string | null>({
  get: () => props.selectedResultId,
  set: (value) => {
    emit('update:selectedResult', value || '');
  }
})

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
