<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index-group />
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref } from 'vue';
import { useRoute } from 'vue-router';
import LfxOpenSourceIndexGroup from '~/components/modules/open-source-index/views/open-source-index-group.vue';
import { OSS_INDEX_API_SERVICE, type SortType } from '~/components/modules/open-source-index/services/osi.api.service';

const route = useRoute();
const slug = ref<string>((route.params.slug as string) || '');
const sort = ref<SortType>((route.query.sort as SortType) || 'totalContributors');

const { data, suspense } = OSS_INDEX_API_SERVICE.fetchOSSCategory(slug.value, sort);

onServerPrefetch(async () => {
  await suspense();
});

const title = computed(() => `${data.value?.name || 'Category'} | Open Source Index`);
const description = computed(
  () =>
    'Browse open source project groups in the Linux Foundation Open Source Index. ' +
    'See how categories like developer tools, frameworks, and platforms rank by contributors and activity.',
);

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
