# @lfx-insights/api

Standalone public API for LFX Insights. See [`docs/arch/PUBLIC_API_PLAN.md`](./docs/arch/PUBLIC_API_PLAN.md) for full architecture and rollout plan.

## Layout

- `src/` — Fastify service.
  - `versions/<prefix>/` — one folder per API version (`v1`, `v1-alpha`). Its `index.ts` is the plugin the registry mounts under that prefix.
  - `versions/v1-alpha/development/` — one route module per Development endpoint, loaded by `@fastify/autoload`. Every file in this folder must default-export a Fastify plugin that registers `/projects/:slug/development/<filename>`; nothing else belongs here. A helper or types file dropped next to the routes fails `app.ready()` and `tests/v1-alpha-autoload.test.ts`, on purpose. Adding an endpoint means adding one file here and one test; no list to edit.
  - `versions/v1-alpha/contributors/` — the same rules for Contributors endpoints, which register `/projects/:slug/contributors/<filename>`. The alpha plugin skips this folder until its first route exists.
  - `lib/` — shared helpers (`period.ts`, `errors.ts`); `schemas/` — shared TypeBox schemas; `clients/` — Tinybird client. Code used by more than one route goes in one of these, never in a `versions/` route folder.
- `docs/site/` — customer-facing VitePress + Scalar docs, built by `pnpm build` and served by the API at `/docs`.
- `docs/arch/` — engineering planning: `PUBLIC_API_PLAN.md`, `CONTEXT.md`, ADRs, architecture review. Not part of the published site.

## Development

```sh
# from repo root
pnpm install --filter @lfx-insights/api

# local config: loaded by src/env.ts at startup
cp api/.env.dist api/.env

# start with hot reload
pnpm --filter @lfx-insights/api dev
```

`src/env.ts` loads `api/.env` at startup; variables already set in the environment take precedence, so deployments keep using real env vars.

## Authentication

Every route under `/v1` and `/v1-alpha` except `openapi.json` needs the Auth0 access token the Cloudflare Worker forwards ([ADR-0006](./docs/arch/adr/0006-pat-token-exchange-for-api-credentials.md), [ADR-0009](./docs/arch/adr/0009-api-key-required-for-all-requests.md)). Set `API_AUTH0_ISSUER_URL` to the token's exact `iss`, trailing slash included, and `API_AUTH0_AUDIENCE` to the public API's Auth0 identifier. `API_AUTH_DISABLED=true` skips verification for local development; readiness answers `503` while it is set, so a deployment never serves traffic with it.

## Rate limiting

Each LFID gets a number of requests per second over a sliding window, set by its tier (ADR-0023): premium when the Worker forwards an `x-tier` header, basic otherwise. Both limits are 30 until load tests set them, in `src/rate-limit.ts`. Requests are counted in the Redis at `API_REDIS_URL`. Keys start with `insights-api:ratelimit:`, so the API can share the frontend's Redis. While Redis is unreachable, requests go through unlimited. The limit is skipped while `API_AUTH_DISABLED=true`, so local development needs no Redis.

## Caching

Successful GET responses are cached in the same Redis as the rate limit, under `insights-api:cache:` (ADR-0013, `src/response-cache.ts`). Categories, leaderboards and the OSS index are cached for 24 hours, collections are not cached so an edit shows on the next request, and every other route is cached for an hour, the same tiers as the frontend's `setup/caching.ts`. The contributors, development and popularity metrics of a collection are cached for an hour like their project versions, and they check that the collection is still public before the cache read. The key covers the route, its params, the query params the route declares and the build in `API_BUILD_SHA`, which the deploy workflow sets to the commit, so each deploy starts on fresh entries. The cache is read after auth, the rate limit and the tier check, so a cached response still counts against the caller's limit. Entries expire by TTL only. When Redis is unreachable or slow, requests go to Tinybird. Without `API_REDIS_URL`, as in local development, nothing is cached.

## Telemetry

The API reports to the Datadog agent on its node through `dd-trace`, as the other services in its cluster do (ADR-0024). `src/instrumentation.ts` loads ahead of the app through `node --import`, as the `start` script and the Dockerfile do, and stays off until `DD_AGENT_HOST` is set; the standard `DD_*` variables configure the rest, with `insights-api` as the default service name. Each request is a `fastify.request` trace named by route template, which gives APM latency, hits and errors per endpoint, and its root span carries the caller's LFID as `usr.id` and their tier as `usr.tier`. Each Tinybird pipe call is a `tinybird.query` span named by pipe. Health probes are not traced. Custom metrics go to DogStatsD under `insights.api.` with low-cardinality tags, since Datadog bills each tag combination: `request.count` and `request.duration` by `endpoint`, `version`, `status_class` and `tier`; `tinybird.duration` by `pipe` and `status_class`; `tinybird.errors` by `pipe` and `error_type`; `postgres.duration` by `query_name` and `outcome`; `ratelimit.rejections` by `tier` and `endpoint`; `auth.failures` by `reason`; `cache.lookups` by `endpoint` and `result` (`hit`, `miss`, `bypass`); and the Tinybird queue's `concurrency` by `state` (`active`, `queued`, `limit`). Logs stay on stdout, and `dd-trace` adds `dd.trace_id` and `dd.span_id` to each line. `API_LOG_LEVEL` sets the lowest level logged (`debug`, `info`, `warn` or `error`), `info` by default, and applies to the Tinybird client's events too. To print spans locally, build, then run `DD_AGENT_HOST=127.0.0.1 DD_TRACE_EXPERIMENTAL_EXPORTER=log pnpm start`.

## Deployment

A merge to `main` deploys the API to production through the Public API Deploy workflow (`.github/workflows/public-api-deploy.yaml`) when `api/`, the libs it builds from, or the lockfile differ from the commit the `production-api` environment last deployed successfully, so a failed or superseded deploy is retried by the next run. Every new pod must then answer `200` on `/health/ready`, or the workflow rolls the deployment back. Each run is recorded under the `production-api` environment in the repository's Deployments.

## Scripts

| Command          | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`       | Start with hot reload via `tsx watch`                                         |
| `pnpm start`     | Run compiled output                                                           |
| `pnpm build`     | Compile TypeScript to `dist/` and build the VitePress docs site (`docs/site`) |
| `pnpm tsc-check` | Type check without emit                                                       |
| `pnpm test`      | Run Vitest tests                                                              |

Linting and formatting run from the repo root with `pnpm lint` (oxlint) and `pnpm format` (oxfmt), not from this package.
