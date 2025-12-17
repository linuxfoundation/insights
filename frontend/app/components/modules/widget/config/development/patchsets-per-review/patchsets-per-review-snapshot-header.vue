<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="flex flex-col gap-2 items-start justify-center min-h-px min-w-px grow shrink-0 basis-0 pb-5 border-b border-neutral-100"
  >
    <h2 class="font-secondary font-bold text-2xl leading-8 text-neutral-900">
      {{ title }}
    </h2>
    <div class="flex gap-2 items-center">
      <div class="relative shrink-0 w-4 h-4">
        <img
          :src="platforms.gerrit?.image"
          alt="Gerrit"
          class="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
      <p class="font-medium text-sm leading-5 text-neutral-900">Gerrit</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { WidgetConfig } from '~/components/modules/widget/config/widget.config';
import { platforms } from '~/config/platforms';

interface PatchsetsPerReviewData {
  dataType?: 'median' | 'average';
  [key: string]: unknown;
}

const props = defineProps<{
  data: PatchsetsPerReviewData;
  config: WidgetConfig;
}>();

const title = computed(() => {
  const dataType = props.data?.dataType || 'median';
  const capitalizedDataType = dataType.charAt(0).toUpperCase() + dataType.slice(1);
  return `${capitalizedDataType} ${props.config.name.toLowerCase()}`;
});
</script>

<script lang="ts">
export default {
  name: 'LfxPatchsetsPerReviewSnapshotHeader',
};
</script>
