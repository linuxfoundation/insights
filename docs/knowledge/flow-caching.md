---
type: data-flow
slug: flow-caching
name: Caching
repo: insights
owner: Insights team
depends_on: [sys-insights, design-caching]
used_by: []
sources:
  - frontend/setup/caching.ts
  - frontend/setup/og-image.ts
  - frontend/app/plugins/vue-query.ts
  - frontend/server/middleware/html-cache-control.ts
  - frontend/server/middleware/og-image.ts
  - frontend/server/utils/cache.ts
  - frontend/server/data/tinybird/
  - libs/tinybird-client/src/bucket-cache.ts
  - api/src/response-cache.ts
  - api/src/clients/bucket-cache.ts
  - api/src/versions/v1-alpha/index.ts
  - workers/api-gateway/src/cache.ts
  - .github/workflows/public-api-deploy.yaml
  - .github/workflows/production-deploy.yaml
  - .github/workflows/production-cache-flush.yaml
  - .github/workflows/production-cache-flush-partial.yaml
---

# Caching

Every cache between a visitor and Tinybird, where it is configured, and how it is cleared. How
the layers connect is drawn in [`docs/design/caching.md`](../design/caching.md).

Nothing in Insights hears about new data in Tinybird. Every cache below expires on its own clock
or is cleared by a deploy or a manual workflow.

## The caches

| Cache                        | Where it is configured                                                       | Key                                                               | Lifetime                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| TanStack Query (browser)     | `frontend/app/plugins/vue-query.ts`                                          | Query key                                                         | `staleTime` 30 s; report modules under `app/components/modules/report/` use 1 h |
| Browser HTTP cache           | Headers from Nitro's route cache, `html-cache-control.ts`, `og-image.ts`     | URL                                                               | `max-age` of the route rule on cached API responses; HTML pages get `no-cache`  |
| Nitro route cache (Redis)    | `frontend/setup/caching.ts`, production builds only                          | `nitro:routes:_:<first 16 path chars>.<hash>.json`                | 1 h or 1 day, per route rule                                                    |
| Nitro cache mount (Redis)    | `frontend/setup/caching.ts`, `frontend/setup/og-image.ts`                    | `nitro-cache:*`                                                   | Rendered OG images, 24 h; Redis TTL 3 days                                      |
| Tinybird bucket IDs (Redis)  | `frontend/server/data/tinybird/`, `libs/tinybird-client/src/bucket-cache.ts` | `project_bucket:<slug>`, `collection_bucket:<slug>`               | 24 h                                                                            |
| Public API responses (Redis) | `api/src/response-cache.ts`                                                  | `insights-api:cache:<build sha>:<route>:<sha256 of input>`        | 1 day for categories, leaderboards, OSS index; 1 h for the rest                 |
| Public API bucket IDs        | `api/src/clients/bucket-cache.ts`                                            | Same as the frontend, in process memory                           | 24 h, per pod                                                                   |
| API gateway entitlements     | `workers/api-gateway/src/cache.ts`                                           | Salted hash of the access token, in Cloudflare's `caches.default` | Token lifetime, at most 10 min                                                  |

## Frontend route cache

`frontend/setup/caching.ts` holds the route rules. The Redis rules apply only when the build has
`NUXT_APP_ENV=production`; other builds, staging included, cache no routes. Storage needs
`NUXT_REDIS_URL`.

- **1 day:** search, categories, `/api/project` (the list), leaderboards, the OSS index,
  `/api/community/list`, the CNCF, AI code tracker and health score coverage reports, and every
  page that no other rule matches (the `**` catch-all).
- **1 hour:** every other `/api/**` route, including the per-project API under
  `/api/project/<slug>/`.
- **Uncached:** auth, health, events, chat, collections, community, security, `/api/report`,
  project and collection pages, the API docs, OG and image routes.
- **Organization pages** (`/organization/**`, 1 day) and `/api/organization-page/**` (1 hour) turn
  off stale-while-revalidate, so they expire in Redis at the TTL.

All other rules keep Nitro's default stale-while-revalidate. Past the TTL, the next request gets
the old entry while Nitro refreshes it in the background, and those Redis keys carry no expiry, so
they stay until a refresh or a clear. Nitro also replays `max-age=<TTL>` to browsers;
`html-cache-control.ts` rewrites that to `no-cache` for HTML, so only API responses keep it.

A route rule declared twice replaces the first one instead of merging; `caching.test.ts` checks
each pattern is declared once.

## Public API cache

`api/src/response-cache.ts` caches GET routes that declare a schema, after auth, rate limiting and
the tier check. Collection routes are uncached except their metric routes. Entries over 1 MB are
skipped. A Redis call that takes over 200 ms falls through to Tinybird, and lookups are counted in
the `cache.lookups` metric. Clients get `Cache-Control: private, max-age=0`
([ADR-0013](../../api/docs/arch/adr/0013-origin-cache-only-private-cache-control.md)). Because the
key holds the build SHA, a new API deploy starts on fresh keys.

## Clearing

| Trigger                                   | What it clears                                                                | Where                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Continuous Deploy of `app`                | Every key in the default Redis database except `auth:*` (session revocations) | `.github/workflows/public-api-deploy.yaml`              |
| Manual production deploy of `frontend`    | The whole Redis instance (`FLUSHALL`)                                         | `.github/workflows/production-deploy.yaml`              |
| Production Cache Flush, by hand           | The whole Redis instance                                                      | `.github/workflows/production-cache-flush.yaml`         |
| Production Cache Flush (Partial), by hand | Keys for one project, the projects of one collection, or leaderboards         | `.github/workflows/production-cache-flush-partial.yaml` |
| A collection like or unlike               | Redis keys containing `collection`                                            | `frontend/server/utils/cache.ts`                        |

The partial workflow matches the 16-character Nitro key prefix, so a project flush also clears
other projects whose slugs share the same first six characters. Staging deploys clear nothing.

## When data looks stale

1. Query Tinybird directly. If it is stale there, the cause is upstream, in CDP's pipeline.
2. Retry with the browser cache disabled in DevTools. A cached API response keeps its `max-age`
   for up to a day.
3. Check the route's rule in `frontend/setup/caching.ts`. Expect up to one TTL of staleness, and
   one more stale response while stale-while-revalidate refreshes the entry.
4. Run the partial flush for the project, or the full flush; see the table above.
5. For public API responses, wait out the TTL or deploy the API.
