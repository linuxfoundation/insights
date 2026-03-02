<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex justify-center items-center min-h-[50vh]">
    <lfx-spinner :size="32" />
  </div>
</template>

<script setup lang="ts">
// import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';
import { navigateTo } from 'nuxt/app';
import LfxSpinner from '~/components/uikit/spinner/spinner.vue';

// const title = 'Collections | LFX Insights';
// const description =
//   'Explore curated collections of open source projects on LFX Insights. ' +
//   'Discover projects grouped by technology, ecosystem, and community.';

// useSeoMeta({
//   title,
//   description,
//   ogTitle: title,
//   twitterDescription: description,
// });

// TODO: Remove this when the discovery page is ready
await navigateTo('/collection/curated', { redirectCode: 301 });
</script>
