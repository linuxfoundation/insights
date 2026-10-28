// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createHash } from 'node:crypto';

import tracer from 'dd-trace';
import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteOptions,
} from 'fastify';

import { dropRedisClient, getRedisClient, withTimeout } from './clients/redis.js';
import { count } from './metrics.js';

// The two tiers of frontend/setup/caching.ts (ADR-0013).
export const LONG_TTL_SECONDS = 86_400;
export const SHORT_TTL_SECONDS = 3_600;

// Matched against the route template without its version prefix. The OSS index is checked first:
// its collections are curated index data, unlike user collections.
const LONG_ROUTES = /^\/(categories|leaderboards|oss-index)(\/|$)/;
// Collections stay uncached, as on the frontend, so an edit shows on the next request.
const UNCACHED_ROUTES = /(^|\/)collections(\/|$)/;

// Keeps a single large response from crowding the frontend's entries out of the shared Redis.
const MAX_ENTRY_BYTES = 1_000_000;
// A Redis that stops answering costs a request at most this before it falls back to Tinybird.
const REDIS_TIMEOUT_MS = 200;

type Lookup = 'hit' | 'miss' | 'bypass';

export function cacheTtl(routeUrl: string): number | undefined {
  const route = routeUrl.replace(/^\/[^/]+/, '');
  if (LONG_ROUTES.test(route)) {
    return LONG_TTL_SECONDS;
  }
  return UNCACHED_ROUTES.test(route) ? undefined : SHORT_TTL_SECONDS;
}

const sortedKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortedKeys);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortedKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
};

// Only declared query params count, since the schemas let unknown ones through and each would add
// an entry. The build keeps a deploy from serving a response an older build produced.
export function cacheKey(
  routeUrl: string,
  params: unknown,
  query: Record<string, unknown>,
  queryKeys: readonly string[],
): string {
  const declared = Object.fromEntries(queryKeys.map((key) => [key, query[key]]));
  const digest = createHash('sha256')
    .update(JSON.stringify(sortedKeys({ params, query: declared })))
    .digest('hex');
  return `insights-api:cache:${process.env.API_BUILD_SHA || 'local'}:${routeUrl}:${digest}`;
}

function report(route: string, lookup: Lookup): void {
  count('cache.lookups', { endpoint: route, result: lookup });
  tracer.scope().active()?.setTag('cache.result', lookup);
}

// Wraps each cacheable GET handler, so auth, the rate limit, the tier check and validation have all
// run before a cached response goes out. Redis trouble sends the request on to Tinybird.
export function cacheResponses(log: FastifyBaseLogger) {
  return (route: RouteOptions): void => {
    const ttl = cacheTtl(route.url);
    const querySchema = route.schema?.querystring as
      | { properties?: Record<string, unknown> }
      | undefined;
    if (ttl === undefined || ![route.method].flat().includes('GET')) {
      return;
    }
    // The schema says which inputs shape a response, so a route without one is left uncached.
    if (!route.schema || (querySchema && !querySchema.properties)) {
      return;
    }
    const queryKeys = Object.keys(querySchema?.properties ?? {});
    const handler = route.handler;

    route.handler = async function cached(
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply,
    ) {
      if (request.method !== 'GET' || !process.env.API_REDIS_URL) {
        return handler.call(this, request, reply);
      }
      const redis = getRedisClient(log);
      if (!redis.isReady) {
        report(route.url, 'bypass');
        return handler.call(this, request, reply);
      }
      const key = cacheKey(
        route.url,
        request.params,
        request.query as Record<string, unknown>,
        queryKeys,
      );
      const abandon = () => dropRedisClient(redis);

      try {
        const entry = await withTimeout(redis.get(key), REDIS_TIMEOUT_MS, abandon);
        if (typeof entry === 'string') {
          const body: unknown = JSON.parse(entry);
          report(route.url, 'hit');
          return body;
        }
      } catch (err: unknown) {
        request.log.warn({ err }, 'Response cache read failed');
        report(route.url, 'bypass');
        return handler.call(this, request, reply);
      }

      report(route.url, 'miss');
      const body: unknown = await handler.call(this, request, reply);
      if (reply.statusCode !== 200) {
        return body;
      }
      // Serialized with the route's response schema before the write, so a body the schema rejects
      // fails this request instead of every request until the entry expires.
      const entry = reply.serialize(body);
      try {
        if (typeof entry === 'string' && Buffer.byteLength(entry) <= MAX_ENTRY_BYTES) {
          await withTimeout(
            redis.set(key, entry, { expiration: { type: 'EX', value: ttl } }),
            REDIS_TIMEOUT_MS,
            abandon,
          );
        }
      } catch (err: unknown) {
        request.log.warn({ err }, 'Response cache write failed');
      }
      return body;
    } as typeof handler;
  };
}
