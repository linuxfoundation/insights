// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useNuxtApp } from 'nuxt/app';
import { EVENT_DEFINITIONS, type EventKey } from '~/components/shared/types/events';
import { useAuth } from '~~/composables/useAuth';

export function useTrackEvent() {
  const { user } = useAuth();

  const trackEvent = ({
    key,
    properties,
  }: {
    key: EventKey;
    properties?: Record<string, unknown>;
  }): void => {
    if (!import.meta.client) return;

    const definition = EVENT_DEFINITIONS[key];
    const payload = {
      key: definition.key,
      type: definition.type,
      name: definition.name,
      feature: definition.feature,
      userId: user.value?.sub ?? undefined,
      source: window.location.href,
      entrySource: document.referrer || undefined,
      properties,
    };

    // Track to Segment via analytics plugin
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { $track } = useNuxtApp() as any;
      $track?.(definition.name, payload);
    } catch (err) {
      console.warn('[Segment] Failed to track event:', definition.key, err);
    }

    // Track to custom database via API
    $fetch('/api/events', {
      method: 'POST',
      body: payload,
    }).catch((err) => {
      console.warn('[Events API] Failed to track event:', definition.key, err);
    });
  };

  return { trackEvent };
}
