<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div>
    <h1>Community Voice</h1>
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue';
// import { PROJECT_COMMUNITY_API_SERVICE } from '~/components/modules/project/services/community.api.service';
// import { useRoute } from 'vue-router';

// const route = useRoute();

// const params = computed(() => ({
//   projectSlug: route.params.slug as string,
//   keywords: ['keyword1', 'keyword2'],
//   sentiments: ['positive', 'negative'],
//   languages: ['en', 'es'],
//   startDate: '2024-01-01',
//   endDate: '2024-12-31',
// }));

// const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, isSuccess, error } =
//   PROJECT_COMMUNITY_API_SERVICE.fetchCommunityMentions(params);

// watch(data, (newData) => {
//   console.log(newData);
// }, { immediate: true });
</script>

<script lang="ts">
export default {
  name: 'LfxProjectCommunityVoiceView',
};
</script>
