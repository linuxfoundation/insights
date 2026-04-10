<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="bg-white lg:!pb-30 pb-20 lg:!-mb-30 -mb-20 flex-grow">
    <lfx-collection-list-view type="my-collections" />
  </div>

  <lfx-collection-auth-wall
    v-if="showAuthWall"
    v-model="showAuthWall"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'nuxt/app';
import LfxCollectionListView from '~/components/modules/collection/views/collection-list.vue';
import LfxCollectionAuthWall from '~/components/modules/collection/components/auth-wall/collection-auth-wall.vue';
import { useAuth } from '~~/composables/useAuth';

const title = 'My Collections | LFX Insights';
const description = 'View and manage your personal collections of open source projects on LFX Insights.';

useSeoMeta({
  title,
  description,
  ogTitle: title,
  twitterDescription: description,
});

const { isAuthenticated } = useAuth();
const showAuthWall = ref(false);

onMounted(() => {
  const route = useRoute();
  const isAuthCallback = route.query.auth === 'success' || route.query.auth === 'logout';

  if (!isAuthCallback && !isAuthenticated.value) {
    showAuthWall.value = true;
  }
});
</script>
