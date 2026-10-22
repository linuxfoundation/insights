---
type: system
slug: sys-insights
name: Insights components
repo: insights
owner: Insights team
depends_on: [contract-insights-cdp, sys-cdp, flow-activities]
used_by: []
sources:
  - frontend/
  - api/src/
  - workers/
  - database/
  - .github/workflows/production-deploy.yaml
  - .github/workflows/staging-deploy.yaml
---

# Insights components

`AGENTS.md` lists the directories and how to run each one. This note covers what each part does
at runtime, what data it reads and how it is deployed.

## Components

| Component                         | Runs as                                                    | Does                                                                                                                                                                                                             | Reads                                                                        |
| --------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `frontend/`                       | Nuxt 4 server, deployment `insights-app-dpl`               | The public site, plus server routes under `frontend/server/api/` for collections, chat, community mentions, security and docs-readiness triggers                                                                 | Tinybird, Insights Postgres, CDP Postgres, Redis page cache                  |
| `api/`                            | Fastify                                                    | The public API, versioned under `src/versions/`; live endpoints are in `/v1-alpha`                                                                                                                               | Tinybird, CDP Postgres (read only)                                           |
| `workers/api-gateway/`            | Cloudflare Worker                                          | Sits in front of the public API: takes a personal access token, exchanges it for a JWT, works out the caller's tier, caches the entitlement and forwards the request over a VPC service binding (`INSIGHTS_API`) | Cloudflare's edge cache (`caches.default`), the token exchange, member tiers |
| `package_downloads_worker`        | Temporal, deployment `package-downloads-worker-dpl`        | Daily package download counts per repository                                                                                                                                                                     | CDP Postgres `repositories`, writes Insights Postgres `package_downloads`    |
| `search_volume_worker`            | Temporal, deployment `search-volume-worker-dpl`            | Monthly search volume per project, from Keywords Everywhere                                                                                                                                                      | Tinybird `projects_list`                                                     |
| `vulnerability_enrichment_worker` | Temporal, deployment `vulnerability-enrichment-worker-dpl` | Enriches CVEs from the NVD API                                                                                                                                                                                   | Insights Postgres                                                            |
| `database/`                       | Flyway in Docker                                           | Migrations for the Insights Postgres only                                                                                                                                                                        |                                                                              |

The workers share a runtime in `workers/temporal/base` (`InsightsServiceWorker`) built on CDP's
`@crowd/archetype-standard`. Which connections a worker opens is set in its `main.ts`.

## Where the data comes from

- **Tinybird** holds almost every metric: contributors, organizations, activity, development
  velocity, packages, collections. The pipes are listed in
  [`cross-repo-contract.md`](cross-repo-contract.md).
- **Insights Postgres** holds what Insights owns: package downloads, chat responses, events,
  security audit data. Its schema is `database/migrations/`.
- **CDP Postgres** holds collections, collection likes and SSO users, which Insights reads and
  writes directly, and the repository list the downloads worker walks.
- **Temporal** is used both for the Insights workers and for two workflows Insights starts on CDP
  workers.

All four crossings into CDP are described in [`cross-repo-contract.md`](cross-repo-contract.md).

## Deployment

`.github/workflows/production-deploy.yaml` and `staging-deploy.yaml` are manual
(`workflow_dispatch`) and take one service at a time: `frontend`, `package-downloads-worker`,
`search-volume-worker` or `vulnerability-enrichment-worker`. Each builds the image, sets it on the
matching Kubernetes deployment in the `insights` namespace. Only the production workflow then
flushes the Redis page cache after a frontend deploy; staging does not, so a staging frontend can
keep serving cached pages after a successful rollout.

Two components are not in those workflows:

- **`api/`** has a `Dockerfile`, but neither deploy workflow offers it.
- **`workers/api-gateway/`** deploys with `pnpm run deploy` (`wrangler deploy --env production`) from
  its own directory. No workflow runs it.

Both workflows run `init-submodules.sh`, so every build resolves `submodules/crowd.dev` to CDP's
current `main`; see the pin behaviour section of the contract.
