<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="text-sm text-neutral-500 flex flex-col items-center justify-center gap-5 py-20"
  >
    <lfx-icon
      name="eyes"
      :size="40"
      class="text-neutral-300"
    />
    <p class="text-center max-w-100">
      {{ label }} metrics are unavailable because the required data isn't available for this project.
    </p>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue';

defineProps<{
  label: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDetailsEmpty'
};
</script>
