// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useRoute } from 'nuxt/app';

export interface TrackEventPayload {
  key: string;
  type: string;
  name: string;
  description?: string;
  properties?: Record<string, unknown>;
  feature?: string;
}

export function useTrackEvent() {
  const route = useRoute();

  const trackEvent = async (payload: TrackEventPayload): Promise<void> => {
    if (!process.client) return;

    try {
      await $fetch('/api/events', {
        method: 'POST',
        body: {
          ...payload,
          source: window.location.href,
          entrySource: document.referrer || undefined,
        },
      });
    } catch {
      // Event tracking failures should never break the user experience
    }
  };

  return { trackEvent, route };
}
