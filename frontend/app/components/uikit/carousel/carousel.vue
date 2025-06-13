<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <pv-carousel
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
  </pv-carousel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CarouselProps } from './types/carousel.types';

const props = defineProps<CarouselProps>();

const responsiveOptions = ref([
    {
        breakpoint: '5000px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '1023px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
    }
]);

</script>

<script lang="ts">
export default {
  name: 'LfxCarousel',
};
</script>
