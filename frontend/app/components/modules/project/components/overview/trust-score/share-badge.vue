<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="border-solid border border-neutral-200 rounded-md p-3 flex flex-col items-start gap-2"
  >
    <img
      :src="badgeUrl"
      alt="Health Score Badge"
      class="w-auto h-4"
    >

    <p class="text-xs leading-4.5 text-neutral-500">
      Share your project Health Score in your GitHub page.
      <br>
      <br>
      <span
        class="text-brand-500 cursor-pointer"
        @click="isGithubBadgeModalOpen = true"
      >Generate badge</span>
    </p>
  </div>

  <lfx-trust-score-github-badge
    v-if="isGithubBadgeModalOpen"
    v-model="isGithubBadgeModalOpen"
    :overall-score="overallScore"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LfxTrustScoreGithubBadge from "~/components/modules/project/components/overview/trust-score/gh-badge.vue";
import { getBadgeUrl, lfxTrustScore, type TrustScoreConfig } from "~/components/modules/project/config/trust-score";

const props = defineProps<{
  overallScore: number;
}>();

const scoreConfig = computed<TrustScoreConfig>(() => lfxTrustScore.find(
      (s) => props.overallScore <= s.maxScore && props.overallScore >= s.minScore
  ) || lfxTrustScore.at(-1)!);

const isGithubBadgeModalOpen = ref(false);
const badgeUrl = computed(() => getBadgeUrl(scoreConfig.value));

</script>

<script lang="ts">
export default {
  name: 'LfxTrustScoreShareBadge',
}
</script>
