# @lfx-insights/api

Standalone public API for LFX Insights. See [`docs/arch/PUBLIC_API_PLAN.md`](./docs/arch/PUBLIC_API_PLAN.md) for full architecture and rollout plan.

## Layout

- `src/` — Fastify service.
- `docs/site/` — customer-facing VitePress + Scalar docs (T-029, not yet built). Served at `api.insights.linuxfoundation.org/docs`.
- `docs/arch/` — engineering planning: `PUBLIC_API_PLAN.md`, `CONTEXT.md`, ADRs, architecture review. Not part of the published site.

## Development

```sh
# from repo root
pnpm install --filter @lfx-insights/api

# start with hot reload (requires PORT env var or defaults to 4000)
pnpm --filter @lfx-insights/api dev
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start with hot reload via `tsx watch` |
| `pnpm start` | Run compiled output |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm lint` | ESLint (no warnings allowed) |
| `pnpm tsc-check` | Type check without emit |
| `pnpm test` | Run Vitest tests |
| `pnpm format:check` | Prettier check |
