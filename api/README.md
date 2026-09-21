# @lfx-insights/api

Standalone public API for LFX Insights. See [`docs/arch/PUBLIC_API_PLAN.md`](./docs/arch/PUBLIC_API_PLAN.md) for full architecture and rollout plan.

## Layout

- `src/` — Fastify service.
  - `versions/<prefix>/` — one folder per API version (`v1`, `v1-alpha`). Its `index.ts` is the plugin the registry mounts under that prefix.
  - `versions/v1-alpha/development/` — one route module per Development endpoint, loaded by `@fastify/autoload`. Every file in this folder must default-export a Fastify plugin that registers `/projects/:slug/development/<filename>`; nothing else belongs here. A helper or types file dropped next to the routes fails `app.ready()` and `tests/v1-alpha-autoload.test.ts`, on purpose. Adding an endpoint means adding one file here and one test; no list to edit.
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

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start with hot reload via `tsx watch` |
| `pnpm start` | Run compiled output |
| `pnpm build` | Compile TypeScript to `dist/` and build the VitePress docs site (`docs/site`) |
| `pnpm lint` | ESLint (no warnings allowed) |
| `pnpm tsc-check` | Type check without emit |
| `pnpm test` | Run Vitest tests |
| `pnpm format:check` | Prettier check |
