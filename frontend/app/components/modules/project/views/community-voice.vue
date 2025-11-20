<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="container flex gap-10 py-10">
    <section class="w-full md:w-3/4">
      <lfx-community-results-area
        :is-loading="isPending"
        :is-page-loading="isFetchingNextPage"
        :mentions="mentions"
        :has-next-page="hasNextPage"
        @fetch-next-page="fetchNextPage"
      />
    </section>
    <section
      class="w-1/4 md:block hidden"
      :class="{ 'opacity-50': isPending }"
    >
      <lfx-community-filter-area />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LfxCommunityResultsArea from '../components/community/sections/results-area.vue';
import LfxCommunityFilterArea from '../components/community/sections/filter-area.vue';
import { PROJECT_COMMUNITY_API_SERVICE } from '~/components/modules/project/services/community.api.service';
import type { CommunityMentions } from '~~/types/community/community';
import type { Pagination } from '~~/types/shared/pagination';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { useProjectStore } from '~~/app/components/modules/project/store/project.store';
import { useCommunityStore } from '~~/app/components/modules/project/components/community/store/community.store';

const { showToast } = useToastService();
const { project, startDate, endDate } = storeToRefs(useProjectStore());
const { selectedPlatforms, selectedKeywords, selectedSentiments, selectedLanguages } = storeToRefs(useCommunityStore());

const params = computed(() => ({
  projectSlug: project.value?.slug as string,
  platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
  keywords: selectedKeywords.value.length > 0 ? selectedKeywords.value : undefined,
  sentiments: selectedSentiments.value.length > 0 ? selectedSentiments.value : undefined,
  languages: selectedLanguages.value.length > 0 ? selectedLanguages.value : undefined,
  startDate: startDate.value,
  endDate: endDate.value,
}));

const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
  PROJECT_COMMUNITY_API_SERVICE.fetchCommunityMentions(params);

const errorMessage = computed(() => {
  return error.value?.message || 'Error fetching community mentions';
});

// Flatten all pages of data into a single array of mentions
const mentions = computed(() => {
  // @ts-expect-error - TanStack Query type inference issue with Vue
  const tmpList = data.value?.pages.flatMap((page: Pagination<CommunityMentions>) => page.data) || [];
  return tmpList;
});

// Server-side prefetching for infinite query
onServerPrefetch(async () => {
  // Prefetch the first page of the infinite query on the server
  await PROJECT_COMMUNITY_API_SERVICE.prefetchCommunityMentions(params);
});

watch(error, (err) => {
  if (err) {
    showToast(errorMessage.value, ToastTypesEnum.negative);
  }
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCommunityVoiceView',
};
</script>
