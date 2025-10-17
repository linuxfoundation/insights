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
import {computed, onServerPrefetch, watch} from "vue";
import type {Collection} from "~~/types/collection";
import LfxCollectionDetailsView from "~/components/modules/collection/views/collection-details.vue";
import {TanstackKey} from "~/components/shared/types/tanstack";
import {COLLECTIONS_API_SERVICE} from "~/components/modules/collection/services/collections.api.service";
import {useRichSchema} from "~~/composables/useRichSchema";

const route = useRoute();
const {slug} = route.params;
const { addCollectionSchema } = useRichSchema();

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

const title = computed(() => `${data.value?.name || 'Collection'} Insights`);

// Truncate description to first 1-2 sentences, keeping it under 160 characters
const description = computed(() => {
  const desc = data.value?.description || '';
  if (!desc) return '';

  // Split by sentence endings (. ! ?)
  const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];

  // Try first sentence
  if (sentences[0] && sentences[0].trim().length <= 160) {
    return sentences[0].trim();
  }

  // Try first two sentences
  if (sentences.length > 1) {
    const twoSentences = (sentences[0] + ' ' + sentences[1]).trim();
    if (twoSentences.length <= 160) {
      return twoSentences;
    }
  }

  // Fallback: truncate to 157 chars and add ellipsis
  return desc.substring(0, 157).trim() + '...';
});

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description
})

// Add rich schema for the collection
watch(() => data.value, (value) => {
  if (value) {
    addCollectionSchema(value);
  }
}, { immediate: true });
</script>
