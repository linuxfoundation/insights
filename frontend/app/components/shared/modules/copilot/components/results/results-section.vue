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
          :is-loading="isLoading || isChartLoading"
        />
      </div>
      <div 
        v-if="!isLoading"
        :class="{
          'h-full flex flex-col justify-center min-h-0': isChartLoading,
          'c-card p-4 w-full h-full min-h-0 flex flex-col': !isChartLoading
        }"
      >
        <lfx-copilot-results-toggle
          v-if="!isChartLoading"
          :model-value="selectedTab"
          :data="selectedResultData || []"
          :is-error="isChartError"
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
              :chart-error-type="selectedResultChartErrorType"
              @update:config="handleConfigUpdate"
              @update:is-loading="handleChartLoading"
              @update:is-error="handleChartError"
              @update:is-snapshot-modal-open="isSnapshotModalOpen = $event"
              @on-check-data-click="selectedTab = 'data'"
            />
          </div>
        </template>

        <div
          v-else
          class="flex flex-col items-center justify-center h-full min-h-0"
        >
          <lfx-copilot-error-state error-type="default" />
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
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxCopilotLoadingState from '../shared/loading-state.vue';
import LfxCopilotErrorState from '../shared/error-state.vue';
import { useCopilotStore } from '../../store/copilot.store';
import LfxCopilotTableResults from './table-results.vue';
import LfxCopilotResultsHeader from './results-header.vue';
import LfxCopilotResultsToggle from './results-toggle.vue';
import LfxCopilotChartResults from './chart-results.vue';
import type { Config } from '~~/lib/chat/chart/types';
import type { ChartErrorType } from '~/components/shared/modules/copilot/types/copilot.types';

const emit = defineEmits<{
  (e: 'update:isChartLoading', value: boolean): void;
}>();

const props = defineProps<{
  isLoading: boolean;
}>()

const { resultData, selectedResultId } = storeToRefs(useCopilotStore());

const isChartError = ref(false);
const selectedTab = ref('chart');
const isSnapshotModalOpen = ref(false);
const isChartLoading = ref(true);
const selectedResultConfig = computed<Config | null>(() => {
  return resultData.value.find(result => result.id === selectedResultId.value)?.chartConfig || null;
});

const selectedResultData = computed(() => {
  return resultData.value.find(result => result.id === selectedResultId.value)?.data || null;
})

const selectedResultChartErrorType = computed(() => {
  return resultData.value.find(result => result.id === selectedResultId.value)?.chartErrorType;
})

const isEmpty = computed(() => {
  return !props.isLoading && (!selectedResultData.value || selectedResultData.value.length === 0);
})

const handleConfigUpdate = (config: Config | null, chartErrorType?: ChartErrorType) => {
  if (selectedResultId.value) {
    const result = resultData.value.find(result => result.id === selectedResultId.value);
    if (result) {
      result.chartConfig = config;
      result.title = config?.title?.text || 'Results';
      result.chartErrorType = chartErrorType;
    }
  }
}

const handleChartLoading = (value: boolean) => {
  isChartLoading.value = value;
  emit('update:isChartLoading', value);
}

const handleChartError = (value: boolean) => {
  isChartError.value = value;
}

watch(isChartLoading, (value) => {
  if (value) {
    selectedTab.value = 'chart';
  } 
})
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsSection'
}
</script>
