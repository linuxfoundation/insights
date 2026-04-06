// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { EVENT_DEFINITIONS, type EventKey } from '~/components/shared/types/events';

export function useTrackEvent() {
  const trackEvent = async ({
    key,
    properties,
  }: {
    key: EventKey;
    properties?: Record<string, unknown>;
  }): Promise<void> => {
    if (!process.client) return;

    try {
      await $fetch('/api/events', {
        method: 'POST',
        body: {
          ...EVENT_DEFINITIONS[key],
          properties,
          source: window.location.href,
          entrySource: document.referrer || undefined,
        },
      });
    } catch {
      // Event tracking failures should never break the user experience
    }
  };

  return { trackEvent };
}
