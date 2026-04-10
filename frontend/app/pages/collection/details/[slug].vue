<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 flex-grow">
    <lfx-collection-details-view :slug="slug as string" />
  </div>
</template>

<script setup lang="ts">
import { useHead, useSeoMeta } from 'nuxt/app';
import { useRoute } from 'nuxt/app';
import { useQuery } from '@tanstack/vue-query';
import { computed, onMounted } from 'vue';
import type { Collection } from '~~/types/collection';
import LfxCollectionDetailsView from '~/components/modules/collection/views/collection-details.vue';
import { TanstackKey } from '~/components/shared/types/tanstack';
import { COLLECTIONS_API_SERVICE } from '~/components/modules/collection/services/collections.api.service';
import { useRichSchema } from '~~/composables/useRichSchema';
import { useTrackEvent } from '~~/composables/useTrackEvent';
import { CollectionsEventKey } from '~/components/shared/types/events/collections';

const route = useRoute();
const { slug } = route.params;
const { getCollectionSchema } = useRichSchema();

const queryKey = computed(() => [TanstackKey.COLLECTION, slug]);

const { data } = useQuery<Collection>({
  queryKey,
  queryFn: COLLECTIONS_API_SERVICE.fetchCollection(slug as string),
  retry: false,
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

defineOgImageComponent('collection', {
  collectionSlug: slug as string,
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

const { trackEvent } = useTrackEvent();

onMounted(() => {
  trackEvent({
    key: CollectionsEventKey.VIEW_COLLECTION,
    properties: {
      collectionId: slug as string,
    },
  });
});
</script>
