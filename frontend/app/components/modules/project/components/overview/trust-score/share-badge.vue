<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-neutral-50 rounded-md px-6 py-[9px] flex items-center justify-between gap-3 w-full">
    <div class="flex items-center gap-2.5">
      <img
        :src="props.isRepoSelected ? repoBadgeUrl : badgeUrl"
        alt="Health Score Badge"
        class="w-auto h-4"
      />
      <span class="text-xs text-neutral-600">
        <template v-if="!props.isRepoSelected">Display your project Health score on your GitHub page.</template>
        <template v-else>Display your repository's number of active contributors on your GitHub page.</template>
      </span>
    </div>

    <lfx-button
      type="transparent"
      size="small"
      icon="share-nodes"
      label="Share badge"
      class="shrink-0 !text-accent-500"
      @click="share"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'nuxt/app';
import { useShareStore } from '~/components/shared/modules/share/store/share.store';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { getBadgeUrl } from '~~/config/trust-score';
import LfxButton from '~/components/uikit/button/button.vue';

const props = defineProps<{
  isRepoSelected?: boolean;
}>();

const route = useRoute();

const { openShareModal } = useShareStore();
const { selectedReposValues, selectedRepositories, project } = storeToRefs(useProjectStore());

const badgeUrl = computed(() => getBadgeUrl('health-score', route.params.slug as string));
const repoBadgeUrl = computed(() =>
  getBadgeUrl('active-contributors', route.params.slug as string, selectedReposValues.value),
);

const share = () => {
  const title = [];
  if (project.value?.name) {
    title.push(project.value.name);
    selectedRepositories.value.forEach((repository) => {
      title.push(repository.name);
    });

    title.push('insights | LFX Insights');
  } else {
    title.push(document.title);
  }

  const finalTitle = `${title.join(' ')}`;

  const url = new URL(window.location.href);
  url.hash = '';

  openShareModal({
    url: url.toString(),
    title: finalTitle,
    showGithubBadge: true,
    activeTab: 'github-badge',
  });
};
</script>

<script lang="ts">
export default {
  name: 'LfxTrustScoreShareBadge',
};
</script>
