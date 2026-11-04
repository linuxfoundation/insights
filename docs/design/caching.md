---
type: design
slug: design-caching
name: Caching layers
repo: insights
owner: Insights team
depends_on: [sys-insights]
used_by: [flow-caching]
sources:
  - frontend/setup/caching.ts
  - frontend/app/plugins/vue-query.ts
  - frontend/server/middleware/html-cache-control.ts
  - frontend/server/utils/cache.ts
  - frontend/server/data/tinybird/
  - libs/tinybird-client/src/bucket-cache.ts
  - api/src/response-cache.ts
  - api/src/clients/bucket-cache.ts
  - workers/api-gateway/src/cache.ts
  - .github/workflows/public-api-deploy.yaml
  - .github/workflows/production-deploy.yaml
  - .github/workflows/production-cache-flush.yaml
  - .github/workflows/production-cache-flush-partial.yaml
---

# Caching layers

How the caches in front of Tinybird connect across the site, the public API and the deploy
workflows. Route rules, keys and TTLs are listed in
[`docs/knowledge/flow-caching.md`](../knowledge/flow-caching.md); this page shows the shape.

## Component map

The public API caches in the Redis named by `API_REDIS_URL`, which `response-cache.ts` treats as
shared with the site; its keys carry their own prefix. The API gateway's edge cache holds who the
caller is, not response data.

```mermaid
flowchart LR
  browser["Browser"]
  tq["TanStack Query"]
  nuxt["Nuxt server"]
  gw["API gateway worker"]
  edge["Cloudflare edge cache"]
  api["Public API"]
  mem["In-memory bucket IDs"]
  redis[("Redis")]
  tb[("Tinybird")]

  browser --> tq
  tq -->|"/api/*"| nuxt
  browser -->|"pages"| nuxt
  nuxt -->|"route cache, bucket IDs"| redis
  nuxt --> tb
  gw -->|"entitlements"| edge
  gw --> api
  api -->|"response cache"| redis
  api --> mem
  api --> tb
```

## Request flow through the site

A cached route on the Nuxt server. Routes without a Redis rule skip the cache step and always call
Tinybird.

```mermaid
sequenceDiagram
  participant B as Browser
  participant N as Nuxt server
  participant R as Redis
  participant T as Tinybird

  B->>N: GET /api/...
  N->>R: Read route entry
  alt Fresh entry
    R-->>N: Entry
    N-->>B: Cached response
  else Expired entry
    R-->>N: Old entry
    N-->>B: Old response
    N->>T: Refresh in background
    N->>R: Write entry
  else No entry
    N->>R: Read bucket ID
    N->>T: Query pipe
    T-->>N: Rows
    N->>R: Write entry
    N-->>B: New response
  end
```

Every cached response carries `max-age` set to the rule's TTL, so the browser may answer the next
request itself.

The public API follows the same read, miss and write steps with a fixed TTL and no background
refresh, and it answers with `private, max-age=0`.

## Invalidation flow

No signal reaches Insights when Tinybird data changes, so caches clear only by TTL or by these
triggers.

```mermaid
flowchart LR
  cd["Continuous Deploy, app"]
  manual["Manual frontend deploy"]
  full["Full flush workflow"]
  partial["Partial flush workflow"]
  like["Collection like"]
  apideploy["API deploy"]
  redis[("Redis")]

  cd -->|"all but auth keys"| redis
  manual -->|"FLUSHALL"| redis
  full -->|"FLUSHALL"| redis
  partial -->|"one project, collection or leaderboards"| redis
  like -->|"collection keys"| redis
  apideploy -->|"new key prefix"| redis
```

The flush steps are in the
[Production Cache Flush](../../.github/workflows/production-cache-flush.yaml) and
[Production Cache Flush (Partial)](../../.github/workflows/production-cache-flush-partial.yaml)
workflows.
