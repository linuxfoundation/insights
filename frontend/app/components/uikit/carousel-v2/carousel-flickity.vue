<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    ref="carousel"
    class="flickity-carousel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {onMounted, onBeforeUnmount, ref} from 'vue'
import Flickity from 'flickity'
import 'flickity/css/flickity.css'

const carousel = ref(null)
let flkty = null

const props = withDefaults(defineProps<{
  options: object
}>(), {
  options: () => ({
    cellAlign: 'center',
    contain: true,
    pageDots: false,
    wrapAround: true,
    groupCells: 1,
    selectedAttraction: 0.01,
    friction: 0.15,
    draggable: true,
    freeScroll: false,
  })
});

onMounted(() => {
  flkty = new Flickity(carousel.value, props.options)
})

onBeforeUnmount(() => {
  if (flkty) {
    flkty.destroy()
  }
})
</script>

<script lang="ts">
export default {
  name: 'LfxCarouselFlickity'
}
</script>
