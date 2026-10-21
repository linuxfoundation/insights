# AGENTS.md

LFX Insights: the public site and API behind [insights.linuxfoundation.org](https://insights.linuxfoundation.org/).
It reports contributor, organization, security and package health for open source projects.

This is the entry point for agents and for anyone new to the repo. Claude Code, Codex and
other tools all read this file, so it is the only one. Area-specific rules live in
`.claude/rules/`; repeatable workflows live in `.claude/skills/`.

## Repository layout

A pnpm monorepo. Node 24 (`.nvmrc`), pnpm 10.18.2.

| Path                         | Package                         | What it is                                                                   |
| ---------------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `frontend/`                  | `lfx-insights`                  | Nuxt 4 app, the public site                                                  |
| `api/`                       | `@lfx-insights/api`             | Fastify public API and its OpenAPI docs site                                 |
| `workers/api-gateway/`       | `@lfx-insights/api-gateway`     | Cloudflare Worker, deployed with wrangler                                    |
| `workers/temporal/base/`     | `@insights/temporal-worker`     | Shared worker runtime                                                        |
| `workers/temporal/*_worker/` | `@insights/*-worker`            | Temporal workers: package downloads, search volume, vulnerability enrichment |
| `libs/postgres-client/`      | `@lfx-insights/postgres-client` | Postgres access                                                              |
| `libs/tinybird-client/`      | `@lfx-insights/tinybird-client` | Tinybird query client                                                        |
| `libs/types/`                | `@lfx-insights/types`           | Shared types                                                                 |
| `database/`                  | n/a                             | Flyway migrations and the scripts that run them                              |
| `submodules/crowd.dev/`      | `@crowd/*`                      | Sparse checkout of CDP libraries, see below                                  |
| `scripts/`                   | n/a                             | Repo tooling, including the license-header script                            |

`pnpm-workspace.yaml` lists a `services` package that does not exist in the tree. Ignore it.

## Getting started

```sh
cp .env.dist .env          # fill in the values
./init-submodules.sh       # or --https without SSH keys
pnpm install
```

`init-submodules.sh` must run before `pnpm install`: the workspace links packages out of
`submodules/crowd.dev`, so installing first fails to resolve them.

For a walkthrough including database setup, use the `/setup` skill.

## Running and testing

Install from the repo root with a workspace filter. Run package scripts from the package
directory. Lint and format from the root, where they cover every package.

| Task              | Command                                                               |
| ----------------- | --------------------------------------------------------------------- |
| Install           | `pnpm install --filter <package>` (from root)                         |
| Site              | `cd frontend && pnpm dev` (port 3000)                                 |
| API               | `cd api && pnpm dev` (port 4000, override with `PORT`)                |
| A Temporal worker | `cd workers/temporal/<worker> && pnpm dev`                            |
| API gateway       | `cd workers/api-gateway && pnpm dev`                                  |
| Tests             | `pnpm test` in `frontend/`, `api/` or `workers/api-gateway/` (Vitest) |
| Types             | `pnpm tsc-check` in any package                                       |
| Lint              | `pnpm lint` / `pnpm lint:fix` (oxlint, from root)                     |
| Format            | `pnpm format` / `pnpm format:check` (oxfmt, from root)                |
| Storybook         | `cd frontend && pnpm storybook` (port 6006)                           |
| Docs sites        | `/setup-docs` skill covers VitePress docs and blog                    |

Never use `npm`, `npx` or `yarn`. `.claude/settings.json` only permits `pnpm` and git.

Before opening a PR, run the `/preflight` skill.

## The crowd.dev submodule

Insights depends on the Community Data Platform across four surfaces, none of them a versioned
API: shared library code through this submodule, CDP's Postgres (which Insights both reads and
writes), a shared Tinybird workspace, and Temporal workflows that Insights starts on CDP workers. The full picture is
in [`docs/knowledge/cross-repo-contract.md`](docs/knowledge/cross-repo-contract.md); read it
before changing anything that crosses the boundary.

`submodules/crowd.dev` tracks `CrowdDotDev/crowd.dev` and its libraries are linked into the
workspace as `@crowd/*` packages.

The checkout is **sparse**. `init-submodules.sh` fetches `services/archetypes`,
`services/base.tsconfig.json`, and these libraries only:

```
audit-logs  common  common_services  data-access-layer  database  integrations
logging  nango  opensearch  questdb  queue  redis  slack  snowflake
telemetry  temporal  types
```

Nothing else from crowd.dev is on disk, documentation included. To read anything outside that
list, add it to the sparse list or clone crowd.dev separately.

Only `workers/` imports `@crowd/*`. `api/`, `frontend/` and `libs/` import none of it, so the
real coupling is far narrower than the sparse list suggests; the contract doc lists the exact
symbols.

Two facts worth knowing before you change anything that touches `@crowd/*`:

- The repo records a fixed submodule commit, but the deploy path does not use it.
  `init-submodules.sh` re-adds the submodule with `git submodule add -b main`, which resolves
  `main` to its current tip, and both `production-deploy.yaml` and `staging-deploy.yaml` run
  that script. Builds are therefore not reproducible against a given insights commit.
- Treat `@crowd/*` exports as an external API. Changing them means changing another repository.

## Where things are documented

- API architecture decisions: `api/docs/arch/adr/`. Format is enforced by
  `.claude/rules/adr-format.md`; use the `/adr` skill to add one.
- API reference: built with VitePress from `api/docs/site/`, served by the API itself.
- Auth setup: `frontend/AUTH_CONFIGURATION.md`.
- Contribution guide: `CONTRIBUTING.md`.
- What Insights shares with CDP, and what breaks it:
  [`docs/knowledge/cross-repo-contract.md`](docs/knowledge/cross-repo-contract.md).

## API conventions

Routes are registered through `src/versions/registry.ts`, which maps a URL prefix to a Fastify
plugin. `src/versions/lifecycle.ts` applies deprecation and sunset headers.

Live work happens in `/v1-alpha`. `/v1` is registered but still a stub, so add new endpoints
under `v1-alpha` unless you are deliberately promoting one.

Schemas use TypeBox via `@fastify/type-provider-typebox`. Shared schema definitions live in
`src/schemas/`, business logic in `src/lib/`, external clients in `src/clients/`.

## Frontend conventions

Paths below are relative to `frontend/`.

```
app/            Application code
  components/   Vue components, with the design system under components/uikit/
  pages/        File-based routing
  layouts/      Nuxt layouts
  middleware/   Client-side middleware
  plugins/      Nuxt plugins
  config/       Feature configuration
  assets/       Static assets and styles
server/         Server-side code: api/, data/, repo/, middleware/, helpers/, mocks/
composables/    Vue composables
types/          Type definitions
setup/          Nuxt config, split one concern per file
```

Stack: Nuxt 4 and Vue 3, Tailwind with PrimeVue, Pinia for client state, TanStack Vue Query
for server state, ECharts for charts, Auth0 for authentication, Vitest and Happy DOM for tests.

- Always build UI from `app/components/uikit/`. See `.claude/rules/always-use-uikit.md`.
- Check `tailwind.config` for the class names that actually exist before using one.
- Nuxt config is modular under `setup/`, one concern per file: `head.ts`, `tailwind.ts`,
  `primevue.ts`, `caching.ts`, `sitemap.ts`, `analytics.ts`, `echarts.ts`, `hooks.ts`,
  `image.ts`, `modules.ts`, `og-image.ts`, `robots.ts`, `runtime-config.ts`, `site.ts`,
  `vite.ts`, `vue.ts`, `rate-limiter.ts`.
- Auth0 runs the PKCE flow with server-side sessions in HTTP-only cookies. Routes live at
  `/api/auth/login`, `/api/auth/callback` and `/api/auth/logout`; `useAuth` holds client state.
  Callbacks differ per environment, and the Auth0 domain differs between staging and production.

## Data

Postgres has separate read and write hosts. The workers configure them through `INSIGHTS_DB_*`
(`WRITE_HOST`, `READ_HOST`, `PORT`, `USERNAME`, `PASSWORD`, `DATABASE`). The Nuxt server reads the
`insightsDb*` keys in `frontend/setup/runtime-config.ts`, which deployments set through
`NUXT_INSIGHTS_DB_*`.

Migrations are Flyway, run in Docker. `database/create_migration.sh <name>` writes a new
`V<epoch>__<name>.sql`; `database/migrate.sh` applies them. Use the `/db-migrate` skill.

Analytics data comes from Tinybird. Temporal connection settings use the
`INSIGHTS_TEMPORAL_*` variables.

## Code quality

- TypeScript is strict. Run `pnpm tsc-check` before committing.
- Husky pre-commit hooks run lint-staged, which adds license headers to `.js`, `.ts` and `.vue`
  files via `scripts/add-license.js`.
- Commits follow Conventional Commits, validated by commitlint. PR titles are linted too.
- Commits need a DCO sign-off. If the check fails, use the `/dco` skill.

### Code comments

- Comment the why, not the what. A comment earns its place by stating a constraint, workaround,
  external quirk, or tradeoff the code cannot show.
- Keep comments terse: at most 2 sentences or 35 words. If it needs more, restructure the code
  or move the explanation to a doc.
- Skip narration comments that restate the next line, and change-log comments ("moved from X",
  "fixed in this PR"); git history covers those.
- Keep ticket numbers out of comments; they belong in PRs and branch names. Describe the cause
  itself instead.
- Never use em dashes in comments.
- Negation chains ("no X, no Y, no Z") are banned; say what the thing is or does instead.
- When behavior is defined elsewhere, point to it ("see setup/caching.ts") instead of
  duplicating the explanation.
- Match the comment density of the surrounding file; write plain English and drop filler like
  "Note that".
