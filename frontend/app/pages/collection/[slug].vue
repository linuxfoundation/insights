<template>
  <lfx-collection-details-view
    :collection="data"
  />
</template>

<script setup lang="ts">
import {
useRoute, createError, showError
} from "nuxt/app";
import {type QueryFunction, useQuery} from "@tanstack/vue-query";
import {computed, onServerPrefetch} from "vue";
import type {Collection} from "~~/types/collection";
import LfxCollectionDetailsView from "~/components/modules/collection/views/collection-details.vue";

const route = useRoute();
const {slug} = route.params;

const queryKey = computed(() => ['collection', slug]);

const fetchCollection: QueryFunction<Collection> = async () => $fetch(`/api/collection/${slug}`)

const {
  data,
    suspense,
    isError,
    error
} = useQuery<Collection>({
  queryKey,
  queryFn: fetchCollection,
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
