// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// import { useNuxtApp } from 'nuxt/app'; // needed when Segment is re-enabled

import { EVENT_DEFINITIONS, type EventKey } from '~/components/shared/types/events';

// type TrackFn = (event: string, props?: Record<string, unknown>) => void; // needed when Segment is re-enabled

export function useTrackEvent() {
  const trackEvent = ({
    key,
    properties,
  }: {
    key: EventKey;
    properties?: Record<string, unknown>;
  }): void => {
    if (!import.meta.client) return;

    const definition = EVENT_DEFINITIONS[key];

    // Segment tracking disabled pending alignment with the analytics team.
    // Re-enable by uncommenting the block below.
    // try {
    //   const { $track } = useNuxtApp() as ReturnType<typeof useNuxtApp> & { $track?: TrackFn };
    //   $track?.(definition.name, {
    //     key: definition.key,
    //     type: definition.type,
    //     name: definition.name,
    //     feature: definition.feature,
    //     source: window.location.href,
    //     entrySource: document.referrer || undefined,
    //     properties,
    //   });
    // } catch (err) {
    //   console.warn('[Segment] Failed to track event:', definition.key, err);
    // }

    // Track to custom database — server derives metadata from key.
    $fetch('/api/events', {
      method: 'POST',
      body: {
        key: definition.key,
        source: window.location.href,
        entrySource: document.referrer || undefined,
        properties,
      },
    }).catch((err) => {
      console.warn('[Events API] Failed to track event:', definition.key, err);
    });
  };

  return { trackEvent };
}
