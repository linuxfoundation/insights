<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching featured collections"
      :is-empty="isEmpty"
    >
      <div class="flex items-center justify-between w-full gap-4">
        <div class="flex items-center gap-4">
          <span class="text-white block bg-neutral-900 rounded-full p-2">
            <lfx-icon
              name="gem"
              :size="24"
            />
          </span>
          <div class="text-neutral-900">
            <h2 class="text-xl font-bold font-secondary mb-1 leading-8">Curated collections</h2>
            <p class="text-sm leading-4">Hand-picked collections from The Linux Foundation.</p>
          </div>
        </div>

        <div>
          <!-- TODO: change this to the correct route when we have the discovery page -->
          <nuxt-link :to="{ name: LfxRoutes.COLLECTIONS_CURATED }">
            <lfx-button
              type="transparent"
              button-style="pill"
            >
              <lfx-icon
                name="rectangle-history"
                :size="16"
              />
              <span class="text-sm text-nowrap">View all</span>
            </lfx-button>
          </nuxt-link>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 mb-10">
        <lfx-collection-card
          v-for="collection in carouselData"
          :key="collection.slug"
          :collection="collection"
        />
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '../services/explore.api.service';
import LfxCollectionCard from '~/components/shared/components/collection-card.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProjectLoadState from '~/components/modules/project/components/shared/load-state.vue';
import { isEmptyData } from '~/components/shared/utils/helper';
import { LfxRoutes } from '~/components/shared/types/routes';
import type { Collection } from '~~/types/collection';

const { data: featuredCollectionsData, status, error, suspense } = EXPLORE_API_SERVICE.fetchFeaturedCollections();

const carouselData = computed(() => featuredCollectionsData.value?.data as Collection[]);

const isEmpty = computed(() => isEmptyData(carouselData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreFeaturedCollection',
};
</script>
