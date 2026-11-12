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

`.github/workflows/public-api-deploy.yaml` deploys to production on every push to `main`. It
compares each service with the commit its GitHub environment last deployed successfully and
deploys only what changed:

- **`api`** (environment `production-api`): the API image, checked through `/health/ready` on every
  new pod and rolled back on failure. Changes under `api/docs` do not redeploy it.
- **`api-gateway`** (environment `production-api-gateway`): the Cloudflare Worker, after the API,
  with a smoke check and a `wrangler rollback` on failure.
- **`app`** (environment `production-app`): the Nuxt app, after the API. Its image also builds the
  API docs and exports the API spec, so changes to `api/docs/site`, `api/src` or the export script
  redeploy it too. A failed rollout is undone, and the Redis page cache is cleared after a successful rollout or
  rollback, keeping the session revocation keys (`auth:*`).
- **Temporal workers** (environments `production-package-downloads-worker`,
  `production-search-volume-worker` and `production-vulnerability-enrichment-worker`): each worker
  redeploys when its own directory, `workers/temporal/base`, the root `package.json`, the lockfile,
  `pnpm-workspace.yaml`, `.dockerignore`, `init-submodules.sh` or the submodule pin changes. The
  pods have no probes, so the job waits until every new pod logs its Temporal worker reaching
  `RUNNING`, checks a minute later that the pod has not restarted, and undoes the rollout otherwise.

The workflow can also be dispatched by hand from `main` only. It forces the selected service (or all
of them) to deploy and also deploys any other service with detected changes.

`.github/workflows/production-deploy.yaml` and `staging-deploy.yaml` are manual
(`workflow_dispatch`) and take one service at a time: `frontend`, `package-downloads-worker`,
`search-volume-worker` or `vulnerability-enrichment-worker`. They can run from any branch, which
makes them the way to put a branch on an environment on demand. Each builds the image and sets it on
the matching Kubernetes deployment in the `insights` namespace. Only the production workflow then
flushes the Redis page cache after a frontend deploy. Staging does not need to: the Redis route
cache rules apply only when `NUXT_APP_ENV` is `production`, so a staging frontend caches no routes.
How caching works is in [`flow-caching.md`](flow-caching.md).

A manual production deploy records no GitHub Deployment, so production keeps that build until the
next push to `main` that changes the same service, or until Continuous Deploy is dispatched with it
(`app` for the frontend).

Both manual workflows and the worker jobs of Continuous Deploy run `init-submodules.sh`, so those
builds resolve `submodules/crowd.dev` to CDP's current `main`; see the pin behaviour section of the
contract.
