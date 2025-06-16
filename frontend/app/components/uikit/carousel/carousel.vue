<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <client-only>
    <Carousel v-bind="carouselConfig">
      <Slide
        v-for="slide in 10"
        :key="slide"
      >
        <div class="carousel__item w-full">
          <div class="h-20 bg-brand-200 w-full">
            {{ slide }}
          </div>
        </div>
      </Slide>

      <template #addons>
        <Navigation />
        <Pagination />
      </template>
    </Carousel>
  </client-only>
  <!-- <pv-carousel
    :value="props.value"
    :circular="props.circular"
    :responsive-options="responsiveOptions"
  >
    <template #item="slotProps">
      <slot
        name="item"
        :data="slotProps.data"
      />
    </template>
  </pv-carousel> -->
</template>

<script setup lang="ts">
// import { ref, onMounted, onUnmounted } from 'vue';
// import type { CarouselProps } from './types/carousel.types';
import {
 Carousel, Slide, Pagination, Navigation
} from 'vue3-carousel'

const carouselConfig = {
  itemsToShow: 3,
  wrapAround: true,
  breakpoints: {
    1024: {
      itemsToShow: 3,
    },
    768: {
      itemsToShow: 2,
    },
    500: {
      itemsToShow: 1,
    },
  }
}

// const props = defineProps<CarouselProps>();

// const responsiveOptions = ref([
//     {
//         breakpoint: '5000px',
//         numVisible: 3,
//         numScroll: 3
//     },
//     {
//         breakpoint: '1023px',
//         numVisible: 2,
//         numScroll: 2
//     },
//     {
//         breakpoint: '767px',
//         numVisible: 1,
//         numScroll: 1
//     }
// ]);

</script>

<script lang="ts">
export default {
  name: 'LfxCarousel',
};
</script>
