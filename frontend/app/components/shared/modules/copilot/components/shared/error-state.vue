<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-5"
  >
    <div
      v-if="!isChartError"
      class="relative text-center"
    >
      <img
        src="/images/misc/loading-state-bg.svg"
        alt="Error state background"
      >
      <lfx-icon
        name="chart-column"
        :size="80"
        class="text-neutral-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
    <div
      v-else
      class="relative text-center flex flex-col items-center justify-center gap-6"
    >
      <lfx-icon
        name="eyes"
        :size="80"
        class="text-neutral-200"
      />
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="text-xl font-secondary font-bold">
          Chart unavailable...more data is needed
        </div>
        <div class="text-xs text-neutral-500">
          We couldn’t generate this chart due to insufficient data. Please review your query and try again.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  isChartError: boolean
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotErrorState'
}
</script>
