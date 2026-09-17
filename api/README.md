# @lfx-insights/api

Standalone public API for LFX Insights. See [`docs/arch/PUBLIC_API_PLAN.md`](./docs/arch/PUBLIC_API_PLAN.md) for full architecture and rollout plan.

## Layout

- `src/` — Fastify service.
- `docs/site/` — customer-facing VitePress + Scalar docs, built by `pnpm build` and served by the API at `/docs`.
- `docs/arch/` — engineering planning: `PUBLIC_API_PLAN.md`, `CONTEXT.md`, ADRs, architecture review. Not part of the published site.

## Development

```sh
# from repo root
pnpm install --filter @lfx-insights/api

# local config: defaults live in the env file, not in code
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
