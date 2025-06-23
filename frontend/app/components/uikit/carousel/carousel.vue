<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="lfx-carousel">
    <div
      ref="carouselContainer"
      class="carousel-container"
    >
      <div
        ref="carouselTrack"
        class="carousel-track"
        :style="trackStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div
          v-for="(item, index) in displayItems"
          :key="`carousel-item-${index}`"
          class="carousel-item"
          :style="itemStyle"
        >
          <slot
            name="item"
            :data="item"
            :index="index"
          />
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <lfx-carousel-navigation
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :disabled="isDragging"
      @next="goToNext"
      @previous="goToPrev"
    />

    <!-- Dots indicator -->
    <div
      v-if="showDots"
      class="carousel-dots"
    >
      <button
        v-for="(dot, index) in totalPages"
        :key="`dot-${index}`"
        class="carousel-dot"
        :class="{ active: index === currentPage }"
        :aria-label="`Go to slide ${index + 1}`"
        type="button"
        @click="goToPage(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
 ref, computed, onMounted, onUnmounted, watch
} from 'vue';
import type { CarouselProps } from './types/carousel.types';
import LfxCarouselNavigation from './carousel-navigation.vue';

const props = withDefaults(defineProps<CarouselProps>(), {
  circular: false,
});

// Reactive references
const carouselContainer = ref<HTMLElement>();
const carouselTrack = ref<HTMLElement>();
const currentIndex = ref(0);
const itemsPerView = ref(3);
const itemsToScroll = ref(3);
const containerWidth = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);

// Responsive breakpoints
const responsiveOptions = [
  {
    breakpoint: 1024,
    numVisible: 3,
    numScroll: 3
  },
  {
    breakpoint: 768,
    numVisible: 2,
    numScroll: 2
  },
  {
    breakpoint: 320,
    numVisible: 1,
    numScroll: 1
  }
];

// Computed properties
const displayItems = computed(() => {
  if (!props.value?.length) return [];

  if (props.circular) {
    // For circular carousel, add clones at the beginning and end
    const clonesBefore = props.value.slice(-itemsPerView.value);
    const clonesAfter = props.value.slice(0, itemsPerView.value);
    return [...clonesBefore, ...props.value, ...clonesAfter];
  }

  return props.value;
});

const totalItems = computed(() => props.value?.length || 0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsToScroll.value));
const currentPage = computed(() => Math.ceil(currentIndex.value / itemsToScroll.value));

const showNavigation = computed(() => totalItems.value > itemsPerView.value);
const canGoPrev = computed(() => {
  if (props.circular) return totalItems.value > 0;
  return currentIndex.value > 0;
});

const canGoNext = computed(() => {
  if (props.circular) return totalItems.value > 0;
  return showNavigation.value && currentIndex.value < totalItems.value - itemsPerView.value;
});

const showDots = computed(() => totalPages.value > 1);

const trackStyle = computed(() => {
  const baseTranslate = props.circular ? -itemsPerView.value * (100 / itemsPerView.value) : 0;
  const currentTranslate = -currentIndex.value * (100 / itemsPerView.value);
  const dragTranslate = isDragging.value ? ((currentX.value - startX.value) / containerWidth.value) * 100 : 0;
  return {
    transform: `translateX(${baseTranslate + currentTranslate + dragTranslate}%)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
    display: 'flex',
  };
});

const itemStyle = computed(() => ({
  width: `${100 / itemsPerView.value}%`,
  flexShrink: 0,
}));

// Methods
const updateResponsiveSettings = () => {
  const width = window.innerWidth;

  for (let i = 0; i < responsiveOptions.length; i += 1) {
    if (responsiveOptions[i] && width >= responsiveOptions[i]!.breakpoint) {
      itemsPerView.value = responsiveOptions[i]!.numVisible || 3;
      itemsToScroll.value = responsiveOptions[i]!.numScroll || 3;
      break;
    }
  }

  // Adjust current index if needed
  if (currentIndex.value >= totalItems.value - itemsPerView.value + 1) {
    currentIndex.value = Math.max(0, totalItems.value - itemsPerView.value);
  }
};

const goToPrev = () => {
  if (!canGoPrev.value) return;

  if (props.circular && currentIndex.value === 0) {
    currentIndex.value = totalItems.value - itemsToScroll.value;
  } else {
    currentIndex.value = Math.max(0, currentIndex.value - itemsToScroll.value);
  }
};

const goToNext = () => {
  if (!canGoNext.value) return;

  if (props.circular && currentIndex.value >= totalItems.value - itemsPerView.value) {
    currentIndex.value = 0;
  } else {
    currentIndex.value = Math.min(
      totalItems.value - itemsPerView.value,
      currentIndex.value + itemsToScroll.value
    );
  }
};

const goToPage = (page: number) => {
  currentIndex.value = Math.min(
    page * itemsToScroll.value,
    totalItems.value - itemsPerView.value
  );
};

// Touch and mouse event handlers
const handleTouchStart = (e: TouchEvent) => {
  if (!e.touches[0]) return;
  isDragging.value = true;
  startX.value = e.touches[0].clientX;
  currentX.value = startX.value;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !e.touches[0]) return;
  e.preventDefault();
  currentX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;

  const deltaX = currentX.value - startX.value;
  const threshold = containerWidth.value * 0.1; // 10% threshold

  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      goToPrev();
    } else {
      goToNext();
    }
  }

  isDragging.value = false;
};

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  startX.value = e.clientX;
  currentX.value = startX.value;
  e.preventDefault();
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  currentX.value = e.clientX;
};

const handleMouseUp = () => {
  if (!isDragging.value) return;

  const deltaX = currentX.value - startX.value;
  const threshold = containerWidth.value * 0.1;

  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      goToPrev();
    } else {
      goToNext();
    }
  }

  isDragging.value = false;
};

// Lifecycle hooks
onMounted(() => {
  updateResponsiveSettings();

  if (carouselContainer.value) {
    containerWidth.value = carouselContainer.value.offsetWidth;
  }

  window.addEventListener('resize', updateResponsiveSettings);

  // Handle circular carousel infinite loop
  if (props.circular) {
    watch(() => currentIndex.value, (newIndex) => {
      if (newIndex < 0) {
        currentIndex.value = totalItems.value - itemsPerView.value;
      } else if (newIndex >= totalItems.value) {
        currentIndex.value = 0;
      }
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsiveSettings);
});
</script>

<script lang="ts">
export default {
  name: 'LfxCarousel',
};
</script>
