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
      <lfx-carousel
        :value="(carouselData as unknown as CarouselData[])"
      >
        <template #item="{data}">
          <lfx-explore-collection-card
            :collection="data"
          />
        </template>
      </lfx-carousel>

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
//   {
//     id: 1,
//     name: 'Featured Collection 1',
//     description: 'Featured Collection 1 description',
//     slug: 'featured-collection-1',
//     featuredProjects: [
//       {
//         name: 'Project 1',
//         slug: 'project-1',
//         logo: 'https://via.placeholder.com/150',
//       },
//       {
//         name: 'Project 2',
//         slug: 'project-2',
//         logo: 'https://via.placeholder.com/150',
//       },
//       {
//         name: 'Project 3',
//         slug: 'project-3',
//         logo: 'https://via.placeholder.com/150',
//       },
//     ],
//   },
//   {
//     id: 2,
//     name: 'Featured Collection 2',
//     description: 'The Cloud Native Computing Foundation (CNCF) is an open-source organization under the Linux Foundation that promotes the development and adoption of cloud-native technologies. It serves as a hub for projects that enable scalable, resilient, and portable applications in modern cloud environments.',
//     slug: 'featured-collection-2',
//   },
//   {
//     id: 3,
//     name: 'Featured Collection 3',
//     description: 'Featured Collection 3 description',
//     slug: 'featured-collection-3',
//   },
//   {
//     id: 4,
//     name: 'Featured Collection 4',
//     description: 'Featured Collection 4 description',
//     slug: 'featured-collection-4',
//   },
//   {
//     id: 5,
//     name: 'Featured Collection 5',
//     description: 'Featured Collection 5 description',
//     slug: 'featured-collection-5',
//   },
//   {
//     id: 6,
//     name: 'Featured Collection 6',
//     description: 'Featured Collection 6 description',
//     slug: 'featured-collection-6',
//   },
//   {
//     id: 7,
//     name: 'Featured Collection 7',
//     description: 'Featured Collection 7 description',
//     slug: 'featured-collection-7',
//   },
//   {
//     id: 8,
//     name: 'Featured Collection 8',
//     description: 'Featured Collection 8 description',
//     slug: 'featured-collection-8',
//   },
//   {
//     id: 9,
//     name: 'Featured Collection 9',
//     description: 'Featured Collection 9 description',
//     slug: 'featured-collection-9',
//   }
// ];
</script>

<script lang="ts">
export default {
  name: 'LfxExploreFeaturedCollection'
};
</script>
