<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <section>
    <lfx-carousel
      :value="(carouselData as unknown as CarouselData[])"
    >
      <template #item="{data}">
        <div class="border border-neutral-200 rounded-lg p-4">
          <h3>{{ data.title }}</h3>
          <p>{{ data.description }}</p>
        </div>
      </template>
    </lfx-carousel>
  </section>
</template>

<script setup lang="ts">
import LfxCarousel from '~/components/uikit/carousel/carousel.vue';
import type { CarouselData } from '~/components/uikit/carousel/types/carousel.types';

const carouselData = [
  {
    id: 1,
    title: 'Featured Collection 1',
    description: 'Featured Collection 1 description',
  },
  {
    id: 2,
    title: 'Featured Collection 2',
    description: 'Featured Collection 2 description',
  },
  {
    id: 3,
    title: 'Featured Collection 3',
    description: 'Featured Collection 3 description',
  },
  {
    id: 4,
    title: 'Featured Collection 4',
    description: 'Featured Collection 4 description',
  },
  {
    id: 5,
    title: 'Featured Collection 5',
    description: 'Featured Collection 5 description',
  },
  {
    id: 6,
    title: 'Featured Collection 6',
    description: 'Featured Collection 6 description',
  },
  {
    id: 7,
    title: 'Featured Collection 7',
    description: 'Featured Collection 7 description',
  },
  {
    id: 8,
    title: 'Featured Collection 8',
    description: 'Featured Collection 8 description',
  },
  {
    id: 9,
    title: 'Featured Collection 9',
    description: 'Featured Collection 9 description',
  }
];
</script>

<script lang="ts">
export default {
  name: 'LfxExploreFeaturedCollection'
};
</script>
