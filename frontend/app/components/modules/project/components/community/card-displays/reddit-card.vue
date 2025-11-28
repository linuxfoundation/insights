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
            {{ mention.subreddit }}
          </a>
          <span
            v-else
            class="text-xs font-medium text-black underline decoration-dashed"
          >
            {{ mention.subreddit }}
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
import LfxCommunityCardHeader from '../fragments/card-header.vue';
import LfxCommunityCardContent from '../fragments/card-content.vue';
import LfxCommunityCardFooter from '../fragments/card-footer.vue';
import LfxCommunityDefaultCard from './default-card.vue';
import type { CommunityMentions } from '~~/types/community/community';

defineProps<{
  mention: CommunityMentions;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityRedditCard',
};
</script>
