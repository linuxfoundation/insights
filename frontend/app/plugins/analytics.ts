// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { watch } from 'vue';
import type { NuxtApp } from 'nuxt/app';
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import { useAuth } from '~~/composables/useAuth';

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  if (process.server) return;
  if (process.env.NODE_ENV !== 'production') return;

  const config = useRuntimeConfig();
  const cdnUrl = config.public.lfxSegmentCdnUrl as string;

  if (!cdnUrl) return;

  // Small helper to load external scripts with a Promise
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });

  // Load analytics asynchronously after the page is interactive
  // Don't block initial render with analytics
  const initAnalytics = async () => {
    try {
      // 1) Load the LFX wrapper script from the CDN
      await loadScript(cdnUrl);

      // 2) Grab the singleton
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const analytics = (window as any)?.LfxAnalytics?.LfxSegmentsAnalytics?.getInstance?.();

      if (!analytics) {
        console.warn('[LFX Segment] LfxSegmentsAnalytics not found on window.');
        return;
      }

      // 3) Initialize
      await analytics.init();

      // 4) Identify authenticated users and reset on sign-out
      const { user, isAuthenticated } = useAuth();

      watch(
        isAuthenticated,
        (authenticated) => {
          if (authenticated && user.value) {
            analytics.identify(user.value.sub, {
              name: user.value.name,
              email: user.value.email,
              username: user.value.username,
            });
          } else {
            analytics.reset();
          }
        },
        { immediate: true },
      );

      const trackPage = () => {
        analytics.page(document.title, {
          path: location.pathname + location.search + location.hash,
          referrer: document.referrer || undefined,
        });
      };

      // 5) First page load
      trackPage();

      // 6) Track subsequent route navigations (Nuxt 3)
      nuxtApp.hook('page:finish', () => {
        trackPage();
      });

      // Expose track for custom feature events
      nuxtApp.provide('track', (event: string, props?: Record<string, unknown>) => {
        analytics.track(event, props);
      });

      // Expose identify for manual calls if needed
      nuxtApp.provide('identify', (id: string, traits?: Record<string, unknown>) => {
        analytics.identify(id, traits);
      });

      nuxtApp.provide('getAnonymousId', () => analytics.getAnonymousId());
      nuxtApp.provide('resetAnalytics', () => analytics.reset());
    } catch (err) {
      console.error('[LFX Segment] init failed:', err);
    }
  };

  // Start loading analytics after the page is interactive (non-blocking)
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      setTimeout(initAnalytics, 0);
    } else {
      window.addEventListener('load', () => {
        setTimeout(initAnalytics, 0);
      });
    }
  }
});
