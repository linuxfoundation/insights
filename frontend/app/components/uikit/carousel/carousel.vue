<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <client-only>
    <Carousel v-bind="carouselConfig">
      <Slide
        v-for="(slide, index) in props.value"
        :key="index"
      >
        <div class="carousel__item">
          <slot
            name="item"
            :data="slide"
          />
        </div>
      </Slide>

      <template #addons>
        <Navigation>
          <template #next>
            <lfx-icon name="angle-right" />
          </template>
          <template #prev>
            <lfx-icon name="angle-left" />
          </template>
        </Navigation>
        <Pagination :paginate-by-items-to-show="true" />
      </template>
    </Carousel>
  </client-only>

  <!-- TODO: Follow up on bug reported on the plugin:
   https://github.com/ismail9k/vue3-carousel/issues/522 -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
 Carousel, Slide, Pagination, Navigation
} from 'vue3-carousel'
import type { CarouselProps } from './types/carousel.types';
import LfxIcon from '@/components/uikit/icon/icon.vue';

const props = defineProps<CarouselProps>();

const carouselConfig = {
  itemsToShow: 3,
  itemsToScroll: 3,
  slideAlign: 'start',
  preventExcessiveDragging: true,
  wrapAround: true,
  gap: 32,
  breakpoints: {
    1280: {
      itemsToShow: 3,
      itemsToScroll: 3,
    },
    1024: {
      itemsToShow: 3,
      itemsToScroll: 3,
    },
    768: {
      itemsToShow: 2,
      itemsToScroll: 2,
      gap: 20,
    },
    500: {
      itemsToShow: 1,
      itemsToScroll: 1,
    },
  }
}

</script>

<script lang="ts">
export default {
  name: 'LfxCarousel',
};
</script>
