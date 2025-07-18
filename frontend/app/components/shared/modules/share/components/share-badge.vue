<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pt-8">
    <p class="text-body-2 text-neutral-500 pb-8">
      Copy and paste your badges directly into your project's GitHub README file,
      providing instant insight into the state of your project.
    </p>

    <div class="flex flex-col gap-6">
      <lfx-share-badge-item
        type="health-score"
        @copied="emit('copied')"
      />
      <lfx-share-badge-item
        type="contributors"
        @copied="emit('copied')"
      />
      <div class="flex flex-col gap-1.5">
        <lfx-share-badge-item
          type="active-contributors"
          @copied="emit('copied')"
        />
        <span class="text-xs text-neutral-400 italic">*Active contributors over the past 365 days</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxShareBadgeItem from "~/components/shared/modules/share/components/share-badge-item.vue";

const emit = defineEmits<{(e: 'copied'): void;}>();
</script>

<script lang="ts">
export default {
  name: 'LfxShareBadge',
}
</script>
