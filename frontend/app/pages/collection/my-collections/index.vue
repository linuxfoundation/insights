<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 flex-grow">
    <lfx-collection-list-view type="my-collections" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'nuxt/app';
import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';
import { useAuth } from '~~/composables/useAuth';

const title = 'My Collections | LFX Insights';
const description = 'View and manage your personal collections of open source projects on LFX Insights.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});

const { isAuthenticated, login } = useAuth();

onMounted(() => {
  const route = useRoute();
  const isAuthCallback = route.query.auth === 'success' || route.query.auth === 'logout';

  if (!isAuthCallback && !isAuthenticated.value) {
    login(window.location.pathname + window.location.search + window.location.hash);
  }
});
</script>
