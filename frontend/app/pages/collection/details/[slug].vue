<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20">
    <lfx-collection-details-view
      :collection="data"
      :loading="isPending"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, createError, showError } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { computed, onServerPrefetch } from 'vue';
import type { Collection } from '~~/types/collection';
import LfxCollectionDetailsView from '~/components/modules/collection/views/collection-details.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useRichSchema } from '~~/composables/useRichSchema';

const route = useRoute();
const { slug } = route.params;
const { getCollectionSchema } = useRichSchema();

const queryKey = computed(() => [TanstackKey.COLLECTION, slug]);

const { data, isPending, suspense, isError, error } = useQuery<Collection>({
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
});

const title = computed(() => `${data.value?.name || 'Collection'} Insights`);

const description = computed(() => {
  const desc = data.value?.description || '';
  if (!desc) return '';

  const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];

  if (sentences[0] && sentences[0].trim().length <= 160) {
    return sentences[0].trim();
  }

  if (sentences.length > 1) {
    const twoSentences = (sentences[0] + ' ' + sentences[1]).trim();
    if (twoSentences.length <= 160) {
      return twoSentences;
    }
  }

  return desc.substring(0, 157).trim() + '...';
});

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});

useHead(getCollectionSchema(data));
</script>
