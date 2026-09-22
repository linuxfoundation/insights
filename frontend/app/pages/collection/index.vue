<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white pb-30 -mb-30 flex-grow">
    <lfx-collection-discover />
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app';
import { onMounted } from 'vue';

import LfxCollectionDiscover from '~/components/modules/collection/views/collection-discover.vue';
import { CollectionsEventKey } from '~/components/shared/types/events/collections';
import { useTrackEvent } from '~~/composables/useTrackEvent';

const { trackEvent } = useTrackEvent();

onMounted(() => {
  trackEvent({
    key: CollectionsEventKey.VIEW_DISCOVER_COLLECTIONS,
  });
});

const title = 'Discover Collections | LFX Insights';
const description =
  'Explore curated collections of open source projects on LFX Insights. ' +
  'Discover projects grouped by technology, ecosystem, and community.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});
</script>
