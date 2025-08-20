<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-5"
  >
    <div
      v-if="errorType === 'default'"
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
        :name="errorType === 'chart-empty' ? 'eyes' : 'triangle-exclamation'"
        :size="80"
        class="text-neutral-200"
      />
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="text-xl font-secondary font-bold">
          {{ errorType === 'chart-empty' ? 
            'Unable to generate chart...more data is needed' : 
            'Oops...something went wrong' }}
        </div>
        <div
          v-if="errorType === 'chart-empty'"
          class="text-xs text-neutral-500"
        >
          We couldn’t generate this chart due to insufficient data. Try adjusting your query.
        </div>
        <div
          v-else
          class="text-xs text-neutral-500"
        >
          An error has occurred while generating your chart. Please try again later or adjust your query.
        </div>
        <div class="flex justify-center gap-5 mt-6">
          <lfx-button
            v-if="errorType === 'chart-error'"
            type="tertiary"
            button-style="pill"
            @click="emit('retry')"
          >
            <lfx-icon
              name="arrow-rotate-left"
              :size="16"
              class="text-neutral-500"
            />
            Retry
          </lfx-button>
          <lfx-button
            type="transparent"
            button-style="pill"
            class="gap-1.5 text-brand-500"
            @click="emit('checkData')"
          >
            <lfx-icon
              name="table-layout"
              :size="16"
              class="text-neutral-500"
            />
            Check data
          </lfx-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import type { ChartErrorType } from '~/components/shared/modules/copilot/types/copilot.types'

const emit = defineEmits<{
  (e: 'retry'): void;
  (e: 'checkData'): void;
}>()

withDefaults(defineProps<{
  errorType: ChartErrorType
}>(), {
  errorType: 'default'
})
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotErrorState'
}
</script>
