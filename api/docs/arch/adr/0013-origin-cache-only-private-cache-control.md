# Responses are cached at the origin (Redis) only; Cache-Control: private, max-age=0

All responses carry `Cache-Control: private, max-age=0`. The origin stores a Redis cache keyed by request params, mirroring the two-tier TTL model already in use by the Insights Nuxt API (`frontend/setup/caching.ts`):

- **Long cache (86 400s / 24h):** stable, infrequently-changing data — project lists, leaderboards, search indexes, category lists, report aggregates.
- **Short cache (3 600s / 1h):** time-series analytics endpoints where data updates throughout the day.

Clients and intermediary proxies/CDNs do not cache responses (`Cache-Control: private, max-age=0`). We chose origin-only caching over public HTTP caching because: (1) some endpoints are user-scoped (Collections) where a shared CDN cache would be a security error; (2) origin Redis gives us a single TTL knob tunable without a contract change. Public cache headers can be introduced later as a non-breaking improvement once per-endpoint analysis is done. Engineers must not add `public` or `s-maxage` headers without a deliberate review.
