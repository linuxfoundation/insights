<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="isLoading"
    class="h-full flex items-center justify-center"
  >
    <lfx-copilot-loading-state title="Generating your chart..." />
  </div>
  <div
    v-else-if="error"
    class="h-full"
  >
    <div class="text-sm text-neutral-500">
      {{ error }}
    </div>
  </div>
  <div
    v-else-if="chartConfig"
    class="h-[450px]"
  >
    <lfx-chart :config="chartConfig" />
  </div>

  <lfx-snapshot-modal
    v-if="isSnapshotModalOpen"
    v-model="isSnapshotModalOpen"
    :widget-name="'chart' as Widget"
    :use-slot="true"
    :data="chartConfig || {}"
    :snapshot-name="chartConfig?.title?.text || 'Insights Chart'"
  >
    <div
      if="chartConfig"
      class="h-[450px]"
    >
      <lfx-chart :config="chartConfig" />
    </div>
  </lfx-snapshot-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { DateTime } from 'luxon';
import type { MessageData } from '../../types/copilot.types';
import { copilotApiService } from '../../store/copilot.api.service';
import LfxCopilotLoadingState from '../loading-state.vue';
import type { Config, DataMapping } from '~~/lib/chat/chart/types';
import LfxChart from '~/components/uikit/chart/chart.vue';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import LfxSnapshotModal from '~/components/modules/widget/components/shared/snapshot/snapshot-modal.vue';
import type { Widget } from '~/components/modules/widget/types/widget';

const emit = defineEmits<{
  (e: 'update:config', value: Config | null): void;
  (e: 'update:isLoading', value: boolean): void;
  (e: 'update:isSnapshotModalOpen', value: boolean): void;
}>();

const props = defineProps<{
  data: MessageData[] | null,
  config: Config | null,
  isSnapshotModalOpen: boolean
}>()

const isSnapshotModalOpen = computed({
  get: () => props.isSnapshotModalOpen,
  set: (value) => {
    emit('update:isSnapshotModalOpen', value);
  }
})

const { token } = storeToRefs(useAuthStore());

const isLoading = ref(false);
const error = ref(null);

const chartConfig = computed({
  get: () => props.config,
  set: (value) => {
    emit('update:config', value);
  }
});

const generateChart = async () => {
  if (!props.data) {
    return;
  }

  isLoading.value = true;
  
  const response = await copilotApiService.callChartApi(props.data, token.value);
  const data = await response.json();
  
  if (data.config && data.success) {
    chartConfig.value = patchChartData(data.config, data.dataMapping);
  } else {
    error.value = data.error || 'Failed to generate chart';
  }
  isLoading.value = false;
}

// Helper function to convert date strings to a specified format using Luxon
function convertDate(value: string, format: string): string {
  // Luxon uses lowercase 'y' for year, so replace any uppercase 'Y' with 'y'
  const luxonFormat = format.replace(/Y/g, 'y');
  let dt = DateTime.fromISO(value);
  if (dt.isValid) {
    return dt.toFormat(luxonFormat);
  }
  // Try fallback formats if ISO fails
  dt = DateTime.fromFormat(value, 'yyyy-MM-dd');
  if (dt.isValid) {
    return dt.toFormat(luxonFormat);
  }
  dt = DateTime.fromFormat(value, 'MM/dd/yyyy');
  if (dt.isValid) {
    return dt.toFormat(luxonFormat);
  }
  // If all fail, return original value
  return value;
}

const patchChartData = (config: Config, dataMapping: DataMapping[] | null) => {
  if (!props.data) {
    return { ...config, dataset: { source: [] } };
  }

  let source: (string | number)[][] = [];

  if (dataMapping && dataMapping.length > 0) {
    // Header row: use convertedFieldName from dataMapping
    const header = dataMapping.map((d) => d.convertedFieldName);
    source.push(header);

    // Data rows: for each data row, map using originalFieldName from dataMapping
    for (const row of props.data) {
      const dataRow = dataMapping.map((d) => {
        let value = row[d.originalFieldName] as string | number;
        if (d.dateConversion && typeof value === 'string') {
          value = convertDate(value, d.dateConversion);
        }
        return value;
      });
      source.push(dataRow);
    }
  } else {
    source = fallbackSource(props.data);
  }

  return { ...config, dataset: { source } };
}

const fallbackSource = (data: MessageData[]) => {
  if (!data || data.length === 0) return [];

  const allKeys = Object.keys(data[0]!);
  // Find the date column (case-insensitive, matches 'date' or ends with 'date')
  // Use Luxon to test if any value in the column is a valid date

  const dateKey = allKeys.find((key) => {
    // Check if at least one value in the column parses as a valid date
    return data.some(row => {
      const value = row[key];
      if (typeof value !== 'string') return false;
      // Try ISO and some common date formats
      return (
        DateTime.fromISO(value).isValid ||
        DateTime.fromFormat(value, 'yyyy-MM-dd').isValid ||
        DateTime.fromFormat(value, 'MM/dd/yyyy').isValid
      );
    });
  });
  // Place date column first, then the rest
  const otherKeys = allKeys.filter((key) => key !== dateKey);
  const header = dateKey ? [dateKey, ...otherKeys] : allKeys;

  const rows = data.map((row) =>
    header.map((key) => {
      const value = row[key] as string | number;
      // Optionally, you could try to format date columns here as well, if needed
      return value;
    })
  );
  return [header, ...rows];
}

watch(() => props.data, () => {
  if (props.data && !chartConfig.value) {
    generateChart();
  }
}, { immediate: true });

watch(isLoading, (newVal) => {
  emit('update:isLoading', newVal);
}, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotTableResults'
}
</script>
