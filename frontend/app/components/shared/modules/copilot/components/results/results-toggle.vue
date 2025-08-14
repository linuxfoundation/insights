<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-between pb-4 mb-4 border-b border-neutral-200">
    <div class="flex-row gap-3 flex">
      <button
        v-for="tab in resultsTabs"
        :key="tab.value"
        type="button"
        class="c-menu-button c-menu-button--dark"
        :class="{
          'is-active': modelValue === tab.value,
        }"
        @click="emit('update:modelValue', tab.value)"
      >
        <lfx-icon
          :name="tab.icon"
          :size="14"
        />
        {{ tab.label }}
      </button>
    </div>

    <lfx-button
      type="tertiary"
      button-style="pill"
      @click="exportData()"
    >
      <lfx-icon :name="modelValue === 'chart' ? 'screenshot' : 'arrow-down-to-line'" />
      {{ modelValue === 'chart' ? 'Snapshot' : 'Export CSV' }}
    </lfx-button>
  </div>
</template>

<script setup lang="ts">
import type { MessageData } from '../../types/copilot.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'openSnapshotModal', value: boolean): void;
}>();

const props = defineProps<{
  modelValue: string;
  data: MessageData[];
}>()

const resultsTabs = [
  { label: 'Chart', value: 'chart', icon: 'chart-column' },
  { label: 'Data', value: 'data', icon: 'table-layout' },
];

const exportData = () => {
  if (props.modelValue === 'data') {
    exportCsv();
  } else {
    emit('openSnapshotModal', true);
    // call screenshot function
  }
}

const exportCsv = () => {
  if (!props.data || props.data.length === 0) {
    return;
  }
  const keys = Object.keys(props.data[0] || {});
  const csvRows = [
    keys.join(','), // header row
    ...props.data.map(row =>
      keys.map(key => {
        const val = row[key];
        // Escape double quotes by doubling them, wrap in quotes if needed
        const escaped = typeof val === 'string'
          ? `"${val.replace(/"/g, '""')}"`
          : (val !== undefined && val !== null ? val : '');
        return escaped;
      }).join(',')
    )
  ];
  const csvContent = csvRows.join('\r\n');
  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'copilot-data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

</script>

<script lang="ts">
export default {
  name: 'LfxCopilotResultsToggle'
}
</script>
