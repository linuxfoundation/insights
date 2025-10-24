<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-open-source-index-category />
</template>

<script setup lang="ts">
import { computed, onServerPrefetch, ref } from 'vue';
import { useRoute } from 'vue-router';
import LfxOpenSourceIndexCategory from '~/components/modules/open-source-index/views/open-source-index-category.vue';
import {
  OSS_INDEX_API_SERVICE,
  type SortType,
} from '~/components/modules/open-source-index/services/osi.api.service';

const route = useRoute();
const slug = ref<string>((route.params.slug as string) || '');
const sort = ref<SortType>((route.query.sort as SortType) || 'totalContributors');

const { data, suspense } = OSS_INDEX_API_SERVICE.fetchOSSCollection(slug.value, sort);

onServerPrefetch(async () => {
  await suspense();
});

const title = computed(() => `${data.value?.name || 'Projects'} Projects | LFX Insights`);
const description = computed(
  () =>
    `View open source projects in the ${data.value?.name || ''} category on LFX Insights. ` +
    `Compare contributor counts, growth trends, and development health across leading projects.`,
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
