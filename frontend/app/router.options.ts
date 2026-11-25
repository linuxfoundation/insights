// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { RouterConfig } from 'nuxt/schema';
import {
  type RouteLocationNormalized,
  type RouterScrollBehavior,
  START_LOCATION,
} from 'vue-router';

import { useRouter } from '#app/composables/router';
import { useNuxtApp } from '#app/nuxt';

type SavedPosition = Parameters<RouterScrollBehavior>[2];

const hashScrollMarginTop = (selector: string) => {
  try {
    const elem = document.querySelector(selector);
    if (elem) {
      return (
        (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) +
        (Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      );
    }
  } catch {}
  return 0;
};

const calculatePosition = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  savedPosition: SavedPosition,
  hashBehavior: ScrollBehavior,
) => {
  if (savedPosition) return savedPosition;
  if (to.hash) {
    const behavior: ScrollBehavior = from === START_LOCATION ? 'instant' : hashBehavior;
    return { el: to.hash, top: hashScrollMarginTop(to.hash), behavior };
  }
  return { left: 0, top: 0 };
};

// Copied from Nuxt 4.5.2's default (same-path query change keeps position); re-diff on Nuxt upgrade
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const router = useRouter();
    const hashBehavior =
      (router.options as Pick<RouterConfig, 'scrollBehaviorType'>).scrollBehaviorType ?? 'auto';

    if (to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')) {
      if (from.hash && !to.hash) return savedPosition ?? { left: 0, top: 0 };
      if (to.hash && to.hash !== from.hash)
        return { el: to.hash, top: hashScrollMarginTop(to.hash), behavior: hashBehavior };
      return false;
    }

    const scrollToTop =
      typeof to.meta.scrollToTop === 'function'
        ? to.meta.scrollToTop(to, from)
        : to.meta.scrollToTop;
    if (scrollToTop === false) return false;
    if (from === START_LOCATION) return calculatePosition(to, from, savedPosition, hashBehavior);

    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => {
          if (router.currentRoute.value.fullPath !== to.fullPath) {
            resolve(false);
            return;
          }
          resolve(calculatePosition(to, from, savedPosition, hashBehavior));
        });
      };
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        const transitionPromise = nuxtApp['~transitionPromise'];
        if (transitionPromise) transitionPromise.then(doScroll);
        else doScroll();
      });
    });
  },
};
