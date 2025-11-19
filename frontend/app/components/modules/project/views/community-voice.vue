<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container flex gap-10 py-10">
    <section class="w-3/4">
      <div v-if="isPending">Loading...</div>
      <lfx-community-results-area
        v-else
        :mentions="mentions"
      />
    </section>
    <section class="w-1/4">
      <lfx-community-filter-area
        @update:platforms="handlePlatformsChange"
        @update:keywords="handleKeywordsChange"
        @update:sentiments="handleSentimentsChange"
        @update:languages="handleLanguagesChange"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref } from 'vue';
import { useRoute } from 'vue-router';
import LfxCommunityResultsArea from '../components/community/sections/results-area.vue';
import LfxCommunityFilterArea from '../components/community/sections/filter-area.vue';
import { PROJECT_COMMUNITY_API_SERVICE } from '~/components/modules/project/services/community.api.service';
import type { CommunityMentions } from '~~/types/community/community';
import type { Pagination } from '~~/types/shared/pagination';

const route = useRoute();

// Filter states
const selectedPlatforms = ref<string[]>([]);
const selectedKeywords = ref<string[]>([]);
const selectedSentiments = ref<string[]>([]);
const selectedLanguages = ref<string[]>([]);

const params = computed(() => ({
  projectSlug: route.params.slug as string,
  platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
  keywords: selectedKeywords.value.length > 0 ? selectedKeywords.value : [],
  sentiments: selectedSentiments.value.length > 0 ? selectedSentiments.value : undefined,
  languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : undefined,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
}));

const { data, isPending } = PROJECT_COMMUNITY_API_SERVICE.fetchCommunityMentions(params);

// Flatten all pages of data into a single array of mentions
const mentions = computed(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  const tmpList = data.value?.pages.flatMap((page: Pagination<CommunityMentions>) => page.data) || [];
  return tmpList;
});

// Filter change handlers
const handlePlatformsChange = (platforms: string[]) => {
  selectedPlatforms.value = platforms;
};

const handleKeywordsChange = (keywords: string[]) => {
  selectedKeywords.value = keywords;
};

const handleSentimentsChange = (sentiments: string[]) => {
  selectedSentiments.value = sentiments;
};

const handleLanguagesChange = (languages: string[]) => {
  selectedLanguages.value = languages;
};

// Server-side prefetching for infinite query
onServerPrefetch(async () => {
  // Prefetch the first page of the infinite query on the server
  await PROJECT_COMMUNITY_API_SERVICE.prefetchCommunityMentions(params);
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCommunityVoiceView',
};
</script>
