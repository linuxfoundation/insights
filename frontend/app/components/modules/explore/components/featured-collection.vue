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
      <client-only>
        <lfx-carousel :value="carouselData">
          <template #header>
            <div class="flex items-center justify-between w-full gap-4">
              <div class="text-neutral-900">
                <h2 class="text-2xl font-bold font-secondary mb-2 leading-8">Featured collections</h2>
                <p class="text-sm">
                  Curated sets of open source projects that belong to the same technology stack or industry domain.
                </p>
              </div>

              <div class="md:block hidden">
                <nuxt-link :to="{ name: LfxRoutes.COLLECTIONS }">
                  <lfx-button
                    type="transparent"
                    button-style="pill"
                  >
                    <lfx-icon
                      name="rectangle-history"
                      :size="16"
                    />
                    <span class="md:text-base text-sm text-nowrap">All collections</span>
                  </lfx-button>
                </nuxt-link>
              </div>
            </div>
          </template>
          <template #item="{ data }">
            <lfx-explore-collection-card :collection="data" />
          </template>
          <template #footer>
            <div class="md:hidden flex justify-center">
              <nuxt-link :to="{ name: LfxRoutes.COLLECTIONS }">
                <lfx-button
                  type="transparent"
                  button-style="pill"
                >
                  <lfx-icon
                    name="rectangle-history"
                    :size="16"
                  />
                  <span class="md:text-base text-sm text-nowrap">All collections</span>
                </lfx-button>
              </nuxt-link>
            </div>
          </template>
        </lfx-carousel>
      </client-only>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '../services/explore.api.service';
import LfxExploreCollectionCard from './collection-card.vue';
import LfxCarousel from '~/components/uikit/carousel/carousel.vue';
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
