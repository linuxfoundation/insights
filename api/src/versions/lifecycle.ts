// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyInstance } from 'fastify';
import { notFoundHandler } from '../errors/not-found.js';
import type { VersionLifecycle } from './registry.js';

function parseDateOrThrow(value: string, field: string): number {
  // The round-trip enforces the YYYY-MM-DD registry format and catches calendar-invalid
  // values that Date.parse silently normalizes (e.g. "2026-02-30").
  const ms = Date.parse(value);
  if (Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== value) {
    throw new Error(`lifecycle ${field} must be a valid YYYY-MM-DD date: "${value}"`);
  }
  return ms;
}

// Lifecycle dates are fixed for the life of the process, so header values are
// computed once at build time and invalid metadata fails the build.
function lifecycleHeaders(lifecycle: VersionLifecycle): Record<string, string> {
  const deprecatedMs = parseDateOrThrow(lifecycle.deprecatedAt, 'deprecatedAt');

  const headers: Record<string, string> = {
    // RFC 9745: '@' plus unix seconds of the deprecation date.
    deprecation: `@${Math.trunc(deprecatedMs / 1000)}`,
  };

  if (lifecycle.sunsetAt !== undefined) {
    const sunsetMs = parseDateOrThrow(lifecycle.sunsetAt, 'sunsetAt');
    if (sunsetMs < deprecatedMs) {
      throw new Error(
        `lifecycle sunset date "${lifecycle.sunsetAt}" is earlier than deprecatedAt "${lifecycle.deprecatedAt}"`,
      );
    }
    // RFC 8594 wants an IMF-fixdate, which toUTCString produces.
    headers.sunset = new Date(sunsetMs).toUTCString();
  }

  const linkParts: string[] = [];
  if (lifecycle.successorPrefix) {
    linkParts.push(`<${lifecycle.successorPrefix}>; rel="successor-version"`);
  }
  if (lifecycle.deprecationDocsUrl) {
    linkParts.push(`<${lifecycle.deprecationDocsUrl}>; rel="deprecation"`);
  }
  if (linkParts.length > 0) {
    headers.link = linkParts.join(', ');
  }

  return headers;
}

// onSend also runs while serializing errors, so failed replies carry the headers too.
export function applyLifecycle(scope: FastifyInstance, lifecycle?: VersionLifecycle): void {
  if (!lifecycle) {
    return;
  }
  const { link, ...rest } = lifecycleHeaders(lifecycle);
  scope.addHook('onSend', (_request, reply, payload, done) => {
    reply.headers(rest);
    if (link) {
      // Merge rather than replace: a route may already set its own Link relations (e.g. pagination).
      const existing = reply.getHeader('link');
      const existingJoined = Array.isArray(existing) ? existing.join(', ') : String(existing ?? '');
      reply.header('link', existingJoined ? `${existingJoined}, ${link}` : link);
    }
    done(null, payload);
  });
  // Fastify's default 404 handler runs in the root context, outside this scope's onSend
  // hook, so the scope registers the shared handler itself to stamp unmatched paths too.
  scope.setNotFoundHandler(notFoundHandler);
}
