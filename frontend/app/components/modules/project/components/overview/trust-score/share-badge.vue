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
        @click="share"
      >Generate badge</span>
    </p>
  </div>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  getScoreBadgeUrl,
  lfxTrustScore,
  type TrustScoreConfig
}
  from "~/components/modules/project/config/trust-score";
import {useShareStore} from "~/components/shared/modules/share/store/share.store";
import { useProjectStore } from "~~/app/components/modules/project/store/project.store";

const props = defineProps<{
  overallScore: number;
}>();

const scoreConfig = computed<TrustScoreConfig>(() => lfxTrustScore.find(
      (s) => props.overallScore <= s.maxScore && props.overallScore >= s.minScore
  ) || lfxTrustScore.at(-1)!);

const badgeUrl = computed(() => getScoreBadgeUrl(scoreConfig.value));

const {openShareModal} = useShareStore();
const { selectedRepositories, project } = storeToRefs(useProjectStore())

const share = () => {
  const title = [];
  if (project.value?.name) {
    title.push(project.value.name);
    selectedRepositories.value.forEach((repository) => {
      title.push(repository.name);
    });

    title.push('insights | LFX Insights');
  }
  else {
    title.push(document.title);
  }

  const finalTitle = `${title.join(' ')}`;

  const url = new URL(window.location.href);
  url.hash = '';

  openShareModal({
    url: url.toString(),
    title: finalTitle,
    showGithubBadge: true,
    activeTab: 'github-badge'
  })
};
</script>

<script lang="ts">
export default {
  name: 'LfxTrustScoreShareBadge',
}
</script>
