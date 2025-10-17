<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-5"
  >
    <div class="relative text-center">
      <NuxtImg
        src="/images/misc/loading-state-bg.svg"
        alt="Loading state background"
        loading="lazy"
        width="240"
        height="240"
      />
      <lfx-icon
        name="chart-column"
        :size="80"
        class="text-neutral-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
    <div
      v-if="isDataReady"
      class="flex items-center justify-center gap-1.5 text-neutral-900"
    >
      <span>
        <lfx-icon
          name="check-circle"
          :type="'solid'"
          :size="20"
          class="text-positive-500"
        />
      </span>
      <p class="text-sm font-medium">
        Data successfully processed
      </p>
    </div>
    <div class="flex items-center justify-center gap-1.5 text-neutral-500">
      <span>
        <lfx-spinner type="light" />
      </span>
      <p class="text-sm font-medium">
        {{ title }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxSpinner from '~/components/uikit/spinner/spinner.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'

withDefaults(defineProps<{
  title?: string;
  isDataReady?: boolean;
}>(), {
  title: 'Getting your data ready...',
  isDataReady: false
});

</script>

<script lang="ts">
export default {
  name: 'LfxCopilotLoadingState'
}
</script>
