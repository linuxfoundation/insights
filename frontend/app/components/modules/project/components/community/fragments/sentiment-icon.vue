<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col items-center gap-2 py-1 w-5 shrink-0 absolute top-0 bottom-0">
    <lfx-icon
      :name="sentimentIcon"
      type="regular"
      :size="16"
      :class="sentimentTextColor"
    />
    <div
      v-if="!hideBar"
      class="flex-1 w-0.5 min-h-5"
      :class="sentimentBarColor"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

const props = defineProps<{
  sentimentLabel: string;
  hideBar?: boolean;
}>();

const sentimentIcon = computed(() => {
  const sentimentLower = props.sentimentLabel.toLowerCase();
  if (sentimentLower === 'positive') {
    return 'face-smile';
  }
  if (sentimentLower === 'negative') {
    return 'face-frown-slight';
  }
  return 'face-meh';
});

const sentimentTextColor = computed(() => {
  const sentimentLower = props.sentimentLabel.toLowerCase();
  if (sentimentLower === 'positive') {
    return 'text-positive-500';
  }
  if (sentimentLower === 'negative') {
    return 'text-negative-500';
  }
  return 'text-neutral-400';
});

const sentimentBarColor = computed(() => {
  const sentimentLower = props.sentimentLabel.toLowerCase();
  if (sentimentLower === 'positive') {
    return 'bg-positive-500';
  }
  if (sentimentLower === 'negative') {
    return 'bg-negative-500';
  }
  return 'bg-neutral-400';
});
</script>

<script lang="ts">
export default {
  name: 'LfxCommunitySentimentIcon',
};
</script>
