<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col w-fit">
    <div
      :class="{
        'my-4': hideOverallScore,
      }"
    >
      <span
        class="text-neutral-900"
        :class="{
          'text-[80px]': !hideOverallScore,
          'text-2xl': hideOverallScore,
        }"
      >
        {{ hideOverallScore ? '?' : Math.round(overallScore) }}</span>
      <span class="text-sm text-neutral-500">/ 100</span>
    </div>
    <lfx-tag
      :size="'medium'"
      :variation="scoreTagStyle"
      type="solid"
      class="justify-center"
    >{{ scoreTag }}</lfx-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxTag from '~/components/uikit/tag/tag.vue';

const props = defineProps<{
  overallScore: number;
  hideOverallScore?: boolean;
}>();

const scoreTag = computed(() => {
  switch (true) {
    case props.hideOverallScore:
      return 'Unavailable';
    case props.overallScore >= 80:
      return 'Rock solid';
    case props.overallScore >= 60:
      return 'Healthy';
    case props.overallScore >= 40:
      return 'Stable';
    case props.overallScore >= 20:
      return 'Unsteady';
    default:
      return 'Critical';
  }
});

const scoreTagStyle = computed(() => {
  switch (true) {
    case props.overallScore >= 80:
      return 'positive-solid';
    case props.overallScore >= 60:
      return 'positive';
    case props.overallScore >= 40:
      return 'info';
    case props.overallScore >= 20:
      return 'warning';
    default:
      return 'negative-solid';
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreDisplay'
};
</script>
