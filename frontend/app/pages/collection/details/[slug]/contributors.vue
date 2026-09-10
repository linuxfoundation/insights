<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-contributors-view />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRequestFetch } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import type { Collection } from '~~/types/collection';
import LfxCollectionContributorsView from '~/components/modules/collection/views/collection-contributors.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';

const route = useRoute();
const { slug } = route.params;
const requestFetch = useRequestFetch();

// Same query key as the parent [slug].vue - this observer only reads the parent's cached
// data for metadata; enabled: false keeps it from ever firing a duplicate request
// (the global 30s staleTime + refetchOnMount would otherwise refetch on tab open)
const { data: collection } = useQuery<Collection>({
  queryKey: computed(() => [TanstackKey.COLLECTION, slug]),
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(slug as string, requestFetch),
  retry: false,
  enabled: false,
});

const title = computed(() =>
  collection.value?.name
    ? `${collection.value.name} Contributors – Collection Insights | LFX Insights`
    : 'Collection Contributors Insights',
);
const description = computed(() =>
  collection.value?.name
    ? `See who contributes across every project in the ${collection.value.name} collection, ` +
      'with insights on maintainers, top contributors, and organizations.'
    : 'See who contributes across every project in this collection.',
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
