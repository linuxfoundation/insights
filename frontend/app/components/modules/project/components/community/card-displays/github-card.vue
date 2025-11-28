<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- Copyright (c) 2025 The Linux Foundation and each contributor. -->
<!-- SPDX-License-Identifier: MIT -->
<template>
  <lfx-community-default-card :mention="mention">
    <div class="flex flex-col gap-5">
      <!-- Header Section -->
      <lfx-community-card-header :mention="mention">
        <template #source-display>
          <a
            v-if="mention.url"
            :href="mention.url"
            class="text-xs font-medium text-black underline decoration-dashed"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ githubRepoName }}
          </a>
          <span
            v-else
            class="text-xs font-medium text-black underline decoration-dashed"
          >
            {{ githubRepoName }}
          </span>
        </template>
      </lfx-community-card-header>

      <!-- Content Section -->
      <lfx-community-card-content :mention="mention" />

      <!-- Relevance Comment Section -->
      <lfx-community-card-footer :mention="mention" />
    </div>
  </lfx-community-default-card>
</template>

<script setup lang="ts">
// Default card display component for community mentions
import { computed } from 'vue';
import LfxCommunityCardHeader from '../fragments/card-header.vue';
import LfxCommunityCardContent from '../fragments/card-content.vue';
import LfxCommunityCardFooter from '../fragments/card-footer.vue';
import LfxCommunityDefaultCard from './default-card.vue';
import type { CommunityMentions } from '~~/types/community/community';

const props = defineProps<{
  mention: CommunityMentions;
}>();

const githubRepoName = computed(() => {
  if (!props.mention.url) {
    return 'Github';
  }
  // Attempt to match GitHub repo URLs, extracting "owner/repo"
  // e.g., "https://github.com/org/repo/issues/123..." => "org/repo"
  const githubUrlRegex = /^https?:\/\/github\.com\/([^\/]+\/[^\/]+)/i;
  const match = props.mention.url.match(githubUrlRegex);
  return match ? match[1] : props.mention.url;
});
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityGithubCard',
};
</script>
