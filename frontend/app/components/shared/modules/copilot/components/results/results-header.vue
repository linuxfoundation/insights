<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-between w-full mb-8">
    <lfx-dropdown-select
      v-model="selectedId"
      class="!w-auto min-w-[200px]"
      :match-width="true"
    >
      <template #trigger="{ selectedOption }">
        <lfx-dropdown-selector
          type="filled"
          class="!w-auto flex justify-between"
        >
          {{ selectedOption.label }}
        </lfx-dropdown-selector>
      </template>

      <lfx-dropdown-item
        v-for="(option, index) of props.results"
        :key="option.id"
        :value="option.id"
        :label="getOptionLabel(option.id)"
      >
        <span>V{{ index + 1 }} Result</span>
      </lfx-dropdown-item>

    </lfx-dropdown-select>
  </div>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import type { ResultsHistory } from '../../types/copilot.types';
import LfxDropdownSelector from "~/components/uikit/dropdown/dropdown-selector.vue";
import LfxDropdownItem from "~/components/uikit/dropdown/dropdown-item.vue";
import LfxDropdownSelect from "~/components/uikit/dropdown/dropdown-select.vue";

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

const getOptionLabel = (id: string) => {
  const idx = props.results.findIndex(r => String(r.id) === String(id));

  return `V${idx + 1} Result`; 
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsHeader'
}
</script>
