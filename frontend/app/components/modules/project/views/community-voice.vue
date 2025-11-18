<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Community Voice</h1>
    <div v-if="isPending">Loading...</div>
    <div v-else-if="error">Error loading community mentions: {{ error.message }}</div>
    <div v-else-if="mentions.length === 0">No community mentions found.</div>
    <lfx-community-results-area
      v-else
      :mentions="mentions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LfxCommunityResultsArea from '../components/community/sections/results-area.vue';
import { PROJECT_COMMUNITY_API_SERVICE } from '~/components/modules/project/services/community.api.service';
import type { CommunityMentions } from '~~/types/community/community';
import type { Pagination } from '~~/types/shared/pagination';

const route = useRoute();

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  keywords: ['keyword1', 'keyword2'],
  sentiments: ['positive', 'negative'],
  languages: ['en', 'es'],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
}));

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess, error } =
  PROJECT_COMMUNITY_API_SERVICE.fetchCommunityMentions(params);

// Flatten all pages of data into a single array of mentions
const mentions = computed(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  const tmpList = data.value?.pages.flatMap((page: Pagination<CommunityMentions>) => page.data) || [];
  return tmpList;
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCommunityVoiceView',
};
</script>
