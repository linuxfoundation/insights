<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <div class="flex flex-row justify-between items-center gap-10">
      <div class="text-neutral-900">
        <h2 class="text-2xl font-bold font-secondary mb-2 leading-8">
          Featured collections
        </h2>
        <p class="text-sm">
          Curated sets of open source projects that belong to the same technology stack or industry domain.
        </p>
      </div>
      <nuxt-link
        :to="{name: LfxRoutes.COLLECTIONS}"
        class="sm:block hidden"
      >
        <lfx-button
          type="transparent"
        >
          <lfx-icon
            name="rectangle-history"
            :size="20"
            class="md:!inline-block !hidden"
          />
          <lfx-icon
            name="rectangle-history"
            :size="16"
            class="md:!hidden !inline-block"
          />
          <span class="md:text-base text-sm text-nowrap">All collections</span>
        </lfx-button>
      </nuxt-link>
    </div>
    <lfx-project-load-state
      :status="status"
      :error="error"
      error-message="Error fetching featured collections"
      :is-empty="isEmpty"
    >
      <client-only>
        <lfx-carousel-flickity
          :options="{
            cellAlign: 'center',
            contain: true,
            pageDots: false,
            wrapAround: true,
            groupCells: 1,
            selectedAttraction: 0.01,
            friction: 0.15,
            draggable: true,
            freeScroll: false,
          }"
        >
          <lfx-explore-collection-card
            v-for="data of featuredCollectionsData.data"
            :key="data.id"
            :collection="data"
          />
        </lfx-carousel-flickity>
      </client-only>
      <div class="sm:hidden block flex justify-center">
        <nuxt-link :to="{name: LfxRoutes.COLLECTIONS}">
          <lfx-button
            type="transparent"
          >
            <lfx-icon
              name="rectangle-history"
              :size="20"
              class="md:!inline-block !hidden"
            />
            <lfx-icon
              name="rectangle-history"
              :size="16"
              class="md:!hidden !inline-block"
            />
            <span class="md:text-base text-sm text-nowrap">All collections</span>
          </lfx-button>
        </nuxt-link>
      </div>
    </lfx-project-load-state>
  </section>
</template>

<script setup lang="ts">
import { computed, onServerPrefetch } from 'vue';
import { EXPLORE_API_SERVICE } from '../services/explore.api.service';
import LfxExploreCollectionCard from './collection-card.vue';
import LfxCarousel from '~/components/uikit/carousel/carousel.vue';
import type { CarouselData } from '~/components/uikit/carousel/types/carousel.types';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxProjectLoadState from "~/components/modules/project/components/shared/load-state.vue";
import { isEmptyData } from '~/components/shared/utils/helper';
import { LfxRoutes } from '~/components/shared/types/routes';
import LfxCarouselFlickity from "~/components/uikit/carousel-v2/carousel-flickity.vue";

const {
  data: featuredCollectionsData,
  status,
  error,
  suspense
} = EXPLORE_API_SERVICE.fetchFeaturedCollections();

const carouselData = computed(() => featuredCollectionsData.value?.data);

const isEmpty = computed(() => isEmptyData(carouselData.value as unknown as Record<string, unknown>[]));

onServerPrefetch(async () => {
  await suspense();
});
</script>

<script lang="ts">
export default {
  name: 'LfxExploreFeaturedCollection'
};
</script>
