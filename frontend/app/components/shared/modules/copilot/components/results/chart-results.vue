<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="isLoading"
    class="h-full"
  >
    <lfx-spinner />
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
    class="h-[330px]"
  >
    <lfx-chart :config="chartConfig" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { MessageData } from '../../types/copilot.types';
import { copilotApiService } from '../../store/copilot.api.service';
import type { Config } from '~~/lib/chat/chart/types';
import defaultOption from '~/components/uikit/chart/configs/defaults.chart';
import LfxChart from '~/components/uikit/chart/chart.vue';

const props = defineProps<{
  data: MessageData[] | null
}>()

const isLoading = ref(false);
const error = ref(null);
const chartConfig = ref<Config | null>(null);

const generateChart = async () => {
  if (!props.data) {
    return;
  }

  isLoading.value = true;
  
  const response = await copilotApiService.callChartApi(props.data);
  const data = await response.json();
  
  if (data.config && data.success) {
    chartConfig.value = data.config;// patchChartData(data.config);
  } else {
    error.value = data.error || 'Failed to generate chart';
  }
  isLoading.value = false;
}

const patchChartData = (config: Config) => {
  const series = config.series.map((s: any) => {
    return {
      ...s,
      data: props.data?.map((d: any) => d[s.name]),
    }
  })
  return { ...config, series };
}

watch(() => props.data, () => {
  if (props.data) {
    generateChart();
  } else {
    chartConfig.value = null;
  }
}, { immediate: true });


</script>

<script lang="ts">
export default {
  name: 'LfxCopilotTableResults'
}
</script>
