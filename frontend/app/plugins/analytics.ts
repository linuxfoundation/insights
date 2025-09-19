// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { NuxtApp } from 'nuxt/app'
import {defineNuxtPlugin, useRuntimeConfig} from 'nuxt/app'

const isProduction = process.env.NUXT_APP_ENV === 'production'
export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  if (process.server) return
  if (process.env.NODE_ENV !== 'production' || !isProduction) return

  const config = useRuntimeConfig()
  const cdnUrl = config.public.lfxSegmentCdnUrl as string

  if(!cdnUrl) return;

  // Small helper to load external scripts with a Promise
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })



  try {
    // 1) Load the LFX wrapper script from the CDN
    await loadScript(cdnUrl)

    // 2) Grab the singleton
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analytics = (window as any)?.LfxAnalytics?.LfxSegmentsAnalytics?.getInstance?.()

    if (!analytics) {
      console.warn('[LFX Segment] LfxSegmentsAnalytics not found on window.')
      return
    }

    // 3) Initialize
    await analytics.init()

    const trackPage = () => {
      analytics.page(document.title, {
        path: location.pathname + location.search + location.hash,
        referrer: document.referrer || undefined,
      })
    }

    // 4) First page load
    trackPage();

    // 5) Track subsequent route navigations (Nuxt 3)
    nuxtApp.hook('page:finish', () => {
      trackPage();
    })

    // Optional: expose a tiny helper for custom events anywhere in app
    nuxtApp.provide('track', (event: string, props?: Record<string, unknown>) => {
      analytics.track(event, props)
    })

    // Optional: expose identify for signed-in users (e.g., Auth0)
    nuxtApp.provide('identify', (id: string, traits?: Record<string, unknown>) => {
      analytics.identify(id, traits)
    })

    // Optional: expose anonymous ID helpers if needed
    nuxtApp.provide('getAnonymousId', () => analytics.getAnonymousId())
    nuxtApp.provide('resetAnalytics', () => analytics.reset())
  } catch (err) {
    console.error('[LFX Segment] init failed:', err)
  }
})
