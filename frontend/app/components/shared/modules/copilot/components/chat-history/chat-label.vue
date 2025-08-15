<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <span
    v-if="status !== 'error'"
    class="text-xs text-neutral-500 flex items-center gap-1"
  >
    <lfx-icon
      name="brain"
      :size="12"
    />
    {{ label }}
  </span>
  <span
    v-else
    class="text-xs text-negative-600 flex items-center gap-1"
  >
    <lfx-icon
      name="circle-exclamation"
      type="solid"
      :size="12"
    />
    Error
  </span>
</template>
<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  label: string;
  status: string;
}>()

</script>

<script lang="ts">
export default {
  name: 'LfxChatLabel'
}
</script>