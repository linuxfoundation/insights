<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white pb-30 -mb-30 flex-grow">
    <lfx-collection-list-view type="community" />
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app';
import { onMounted } from 'vue';

import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';
import { CollectionsEventKey } from '~/components/shared/types/events/collections';
import { useTrackEvent } from '~~/composables/useTrackEvent';

const { trackEvent } = useTrackEvent();

onMounted(() => {
  trackEvent({
    key: CollectionsEventKey.VIEW_COMMUNITY_COLLECTIONS,
  });
});

const title = 'Community Collections | LFX Insights';
const description =
  'Explore community collections of open source projects on LFX Insights. ' +
  'Discover projects grouped by technology, ecosystem, and community.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});
</script>
