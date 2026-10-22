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

## Deployment

A merge to `main` that touches `api/`, the libs it builds from, or the lockfile deploys the API to production through the Public API Deploy workflow (`.github/workflows/public-api-deploy.yaml`). Every new pod must then answer `200` on `/health/ready`, or the workflow rolls the deployment back. Each run is recorded under the `production-api` environment in the repository's Deployments.

## Scripts

| Command          | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`       | Start with hot reload via `tsx watch`                                         |
| `pnpm start`     | Run compiled output                                                           |
| `pnpm build`     | Compile TypeScript to `dist/` and build the VitePress docs site (`docs/site`) |
| `pnpm tsc-check` | Type check without emit                                                       |
| `pnpm test`      | Run Vitest tests                                                              |

Linting and formatting run from the repo root with `pnpm lint` (oxlint) and `pnpm format` (oxfmt), not from this package.
