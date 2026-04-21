<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    v-if="isAuthenticated"
    class="bg-white pb-30 -mb-30 flex-grow"
  >
    <lfx-collection-list-view type="my-collections" />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
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

const { isAuthenticated, isReady, login } = useAuth();
const route = useRoute();

watch(
  [isReady, isAuthenticated],
  ([ready, authed]) => {
    if (!ready || !process.client) return;
    const isAuthCallback = route.query.auth === 'success' || route.query.auth === 'logout';
    if (isAuthCallback) return;
    if (!authed) {
      login(window.location.pathname + window.location.search + window.location.hash);
    }
  },
  { immediate: true },
);
</script>
