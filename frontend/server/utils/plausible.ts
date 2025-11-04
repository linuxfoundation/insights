// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';

interface TrackEventOptions {
  props?: Record<string, string | number | boolean>;
}

/**
 * Track a custom event in Plausible Analytics from server-side
 * Only tracks events in production environment
 * Fire and forget - does not block the API response
 *
 * @param event - H3 event object
 * @param eventName - Name of the event to track
 * @param url - URL to associate with the event
 * @param options - Additional options including custom properties
 *
 * @example
 * useApiTrackEvent(event, 'project-insights-api', '/api/project/foo/insights', {
 *   props: { project: 'foo' }
 * })
 */
export function useApiTrackEvent({
  event,
  eventName,
  url,
  options,
  referer,
}: {
  event: H3Event;
  eventName: string;
  url: string;
  referer: string;
  options?: TrackEventOptions;
}) {
  const config = useRuntimeConfig();

  // Only track in production
  if (config.public.appEnv !== 'production') {
    return;
  }

  const forwardedFor =
    getHeader(event, 'x-forwarded-for') ||
    getHeader(event, 'x-real-ip') ||
    event.node.req.socket.remoteAddress ||
    '';

  // Fire and forget - don't await to avoid slowing down the response
  $fetch('https://plausible.io/api/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': getHeader(event, 'user-agent') || 'LFX-Insights-Server',
      'X-Forwarded-For': forwardedFor,
    },
    body: {
      name: eventName,
      url: `${config.public.appUrl}${url}`,
      referer,
      domain: 'insights.linuxfoundation.org',
      props: options?.props,
    },
  }).catch((trackingError) => {
    // Silently fail - don't impact the API response
    console.error('Failed to track Plausible event:', trackingError);
  });
}
