<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-2 items-start justify-center min-h-px min-w-px grow shrink-0 basis-0 pb-5 border-b border-neutral-100"
  >
    <h2 class="font-secondary font-bold text-2xl leading-8 text-neutral-900">
      {{ config.name }}
    </h2>
    <div
      v-if="platformData"
      class="flex gap-2 items-center"
    >
      <div class="relative shrink-0 w-4 h-4">
        <img
          :src="platformData.image"
          :alt="platformData.label"
          class="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
      <p class="font-medium text-sm leading-5 text-neutral-900">
        {{ platformData.label }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';
import { platforms } from '~/config/platforms';

interface ReviewEfficiencyData {
  platform?: string;
  [key: string]: unknown;
}

const props = defineProps<{
  data: ReviewEfficiencyData;
  config: WidgetConfig;
}>();

const platformData = computed(() => {
  const platformKey = props.data?.platform;
  if (!platformKey) return null;

  return platforms[platformKey as keyof typeof platforms] || null;
});
</script>

<script lang="ts">
export default {
  name: 'LfxReviewEfficiencySnapshotHeader',
};
</script>
