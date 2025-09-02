<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pt-5 flex justify-center">
    <div class="flex flex-col items-center justify-center py-20 w-2/3">
      <lfx-icon
        :name="icon"
        class="text-neutral-300 pb-5"
        :size="64"
      />
      <div
        v-if="title"
        class="font-bold text-neutral-500"
      >
        {{ title }}
      </div>
      <p class="text-neutral-500 text-sm text-center pt-3">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxIcon from '~/components/uikit/icon/icon.vue'

defineProps<{
  icon: string
  title?: string
  description: string
}>()
</script>

<script lang="ts">
export default {
    name: 'LfxEmptyState'
}
</script>