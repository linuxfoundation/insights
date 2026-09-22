// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { computed, onMounted, onUnmounted, ref } from 'vue';

const useScroll = () => {
  const scrollTop = ref(0);
  let html: HTMLElement | null = null;
  let rafId = 0;

  const scrollTopPercentage = computed(() => {
    const scrollHeight = html?.scrollHeight || 1;
    const clientHeight = html?.clientHeight || 0;
    return (scrollTop.value / (scrollHeight - clientHeight)) * 100;
  });

  // Scroll events fire at display refresh rate (often 60–120 Hz). Batching updates
  // with requestAnimationFrame avoids doing reactive work more than once per frame,
  // which keeps interaction-to-next-paint low for the many components that react
  // to scrollTop (project header, collection header, etc.).
  const updateScrollTop = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      scrollTop.value = html?.scrollTop || 0;
    });
  };

  const scrollToTop = (value: number = 0, behavior: 'smooth' | 'instant' = 'smooth') => {
    /* adding a small delay to finish the header animation from "fixed" to "relative"
      then scrolling to top again. The window really does go to scroll position 0
      when the header is in the "fixed" position. */
    setTimeout(() => {
      window?.scrollTo({
        top: value,
        behavior,
      });

      if (value === 0) {
        window?.scrollTo({
          top: value,
          behavior,
        });
      }
    }, 100);
  };

  const scrollToTarget = (
    element: HTMLElement,
    headerOffset: number = 220,
    behavior: 'smooth' | 'instant' = 'smooth',
  ) => {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + (html?.scrollTop || 0) - headerOffset;
    scrollToTop(offsetPosition, behavior);
  };

  onMounted(() => {
    html = document.documentElement;
    document?.addEventListener('scroll', updateScrollTop, { passive: true });
    scrollTop.value = html?.scrollTop || 0;
  });

  onUnmounted(() => {
    document?.removeEventListener('scroll', updateScrollTop);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  });

  return {
    scrollTop,
    scrollTopPercentage,
    scrollToTop,
    scrollToTarget,
  };
};

export default useScroll;
