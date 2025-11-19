<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- Copyright (c) 2025 The Linux Foundation and each contributor. -->
<!-- SPDX-License-Identifier: MIT -->
<template>
  <lfx-card class="border border-neutral-100 rounded-xl overflow-hidden">
    <div class="flex flex-col gap-5">
      <!-- Header Section -->
      <lfx-community-card-header :mention="mention">
        <template #source-display>
          <p
            class="text-xs font-medium text-black"
            :class="{ underline: mention.url }"
          >
            {{ mention.subreddit }}
          </p>
        </template>
      </lfx-community-card-header>

      <!-- Content Section -->
      <lfx-community-card-content :mention="mention" />

      <!-- Relevance Comment Section -->
      <lfx-community-card-footer :mention="mention" />
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
// Default card display component for community mentions
import LfxCommunityCardHeader from '../fragments/card-header.vue';
import LfxCommunityCardContent from '../fragments/card-content.vue';
import LfxCommunityCardFooter from '../fragments/card-footer.vue';
import type { CommunityMentions } from '~~/types/community/community';
import LfxCard from '~/components/uikit/card/card.vue';

defineProps<{
  mention: CommunityMentions;
}>();
</script>

<script lang="ts">
export default {
  name: 'LfxCommunityRedditCard',
};
</script>
