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
      :variation="scoreConfig.tagStyle as TagStyle"
      type="solid"
      class="justify-center"
    >{{ scoreConfig.label }}</lfx-tag>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import {lfxTrustScore} from "~/components/modules/project/config/trust-score";
import type {TagStyle} from "~/components/uikit/tag/types/tag.types";

const props = defineProps<{
  overallScore: number;
  hideOverallScore?: boolean;
}>();

const scoreConfig = computed(() => {
  if (props.hideOverallScore) {
    return {label: 'Unavailable', tagStyle: 'default'};
  }
  return lfxTrustScore.find(
      (s) => props.overallScore <= s.maxScore && props.overallScore >= s.minScore
  ) || {
    label: 'Critical',
    tagStyle: 'negative-solid'
  };
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectTrustScoreDisplay'
};
</script>
