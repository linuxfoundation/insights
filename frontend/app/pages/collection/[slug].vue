<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-collection-details-view
    :collection="data"
    :loading="isPending"
  />
</template>

<script setup lang="ts">
import {
useRoute, createError, showError
} from "nuxt/app";
import {useQuery} from "@tanstack/vue-query";
import {computed, onServerPrefetch} from "vue";
import type {Collection} from "~~/types/collection";
import LfxCollectionDetailsView from "~/components/modules/collection/views/collection-details.vue";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {COLLECTIONS_API_SERVICE} from "~/components/modules/collection/services/collections.api.service";

const route = useRoute();
const {slug} = route.params;

const queryKey = computed(() => [TanstackKey.COLLECTION, slug]);

const {
  data,
    isPending,
    suspense,
    isError,
    error
} = useQuery<Collection>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(slug as string),
  retry: false,
});

onServerPrefetch(async () => {
  await suspense();
  if (isError.value) {
    const statusMessage = error.value?.message || 'Collection Not Found';

    if (import.meta.server) {
      throw createError({ statusCode: 404, statusMessage });
    } else {
      showError({ statusCode: 404, statusMessage });
    }
  }
})

const title = computed(() => `${data.value?.name || 'Collection'} | LFX Insights`);
const description = computed(() => `${data.value?.description || ''}`);

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})
</script>
