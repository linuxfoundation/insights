# Cross-repo contract: insights and crowd.dev

LFX Insights depends on the Community Data Platform (CDP, `CrowdDotDev/crowd.dev`) across four
surfaces. None of them is a versioned API. This page records what the two repositories actually
share, so a change on either side can be made deliberately rather than discovered in production.

Insights owns this page because it owns the submodule pin, the sparse checkout, the init script
and the deploy workflows, and because breakage lands here first.

| Surface             | Direction                     | Coupling                                                 |
| ------------------- | ----------------------------- | -------------------------------------------------------- |
| Shared library code | insights imports from CDP     | Source, through a git submodule                          |
| CDP Postgres        | insights reads **and writes** | Direct SQL from three components, no API in between      |
| Tinybird            | both query the same workspace | Named pipe endpoints                                     |
| Temporal            | insights starts CDP workflows | Workflow names, task queues, arguments and payload codec |

## 1. Shared library code

`submodules/crowd.dev` is a git submodule of `CrowdDotDev/crowd.dev`. Its libraries are linked
into the pnpm workspace by `pnpm-workspace.yaml` as `@crowd/*` packages.

CDP is published under two GitHub names, `CrowdDotDev/crowd.dev` and
`linuxfoundation/crowd.dev`. They are the same codebase and track the same `main`; the submodule
points at the first, while day-to-day development pushes to the second.

The checkout is **sparse**. `init-submodules.sh` fetches `services/archetypes`,
`services/base.tsconfig.json`, and seventeen libraries: `audit-logs`, `common`,
`common_services`, `data-access-layer`, `database`, `integrations`, `logging`, `nango`,
`opensearch`, `questdb`, `queue`, `redis`, `slack`, `snowflake`, `telemetry`, `temporal`,
`types`. Nothing else from CDP is on disk, its documentation included.

### Direct imports

Only `workers/` imports `@crowd/*`; `api/`, `frontend/` and `libs/` import none of it. The
entire direct import surface:

| Package                     | Symbols                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `@crowd/archetype-standard` | `Config`, `Service`                                          |
| `@crowd/database`           | `DbStore`, `getDbConnection`                                 |
| `@crowd/logging`            | `Logger`, `LogLevel`, `getServiceChildLogger`                |
| `@crowd/telemetry`          | default export                                               |
| `@crowd/temporal`           | `getDataConverter`                                           |
| `@crowd/slack`              | `SlackChannel`, `SlackPersona`, `sendSlackNotificationAsync` |

A change to any symbol in that table is a breaking change for insights.

### Transitive runtime dependencies

`@crowd/common`, `@crowd/types`, `@crowd/opensearch`, `@crowd/queue` and `@crowd/redis` are
declared by worker packages but imported nowhere in insights source. They are still loaded at
runtime through the packages above: `@crowd/temporal`, for example, imports `IS_DEV_ENV` and
`SERVICE` from `@crowd/common` in `services/libs/temporal/src/index.ts`.

So the contract is wider than the direct import table. An incompatible change inside any of
these packages can break insights workers without touching a single insights import. When
assessing a CDP change, check what the directly imported packages themselves pull in, not only
the table above.

### Pin behaviour

The repository records a fixed submodule commit, but **the deploy path does not use it**.
`init-submodules.sh` deinits the submodule, removes its entry from `.gitmodules`, and re-adds it
with `git submodule add -b main`, which resolves `main` to its current tip.
`.github/workflows/production-deploy.yaml` and `staging-deploy.yaml` both run that script.

The gap is already wide: the recorded pin sits around PR #3863 while CDP `main` is past #5067.
Nothing fails, because no build uses the recorded commit.

Two consequences:

- A production build and a rebuild of the same insights commit can link different CDP code.
- A merge to CDP `main` reaches insights production on the next deploy, with no insights commit
  and no review on this side.

Whether that is intended has not been decided. It is the single largest unguarded path between
the two repositories.

## 2. CDP Postgres

Insights connects directly to CDP's Postgres, as a second database alongside its own. There is
no API between them, and the access is not read-only. Three components hold that connection,
each with its own configuration:

| Component                  | Configuration                                                                                                  | Access         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| Nuxt server                | `cmDb*` keys in `frontend/setup/runtime-config.ts`, gated by `NUXT_CM_DB_ENABLED`, on by default in production | Read and write |
| Public API                 | `API_CM_DB_*` in `api/src/clients/postgres.ts`                                                                 | Read only      |
| `package_downloads_worker` | `CM_DB_*` in `workers/temporal/base/src/worker.ts`, enabled by `cm.enabled: true`                              | Read only      |

The other two Temporal workers set `cm.enabled: false`.

### Tables and their readers

| Table                         | Nuxt server | Public API | Worker |
| ----------------------------- | ----------- | ---------- | ------ |
| `collections`                 | yes         | yes        |        |
| `collectionsInsightsProjects` | yes         | yes        |        |
| `collectionsRepositories`     | yes         | yes        |        |
| `collectionLikes`             | yes         | yes        |        |
| `insightsProjects`            | yes         | yes        |        |
| `insightsSsoUsers`            | yes         | yes        |        |
| `repositories`                | yes         | yes        | yes    |

Where the queries live:

- **Nuxt server**: the repositories in `frontend/server/repo/` built on `cmDbPool`
  (`communityCollection`, `collectionLike`, `insightsProjects`, `insightsSsoUser`), plus routes
  that query `cmDbPool` directly: `server/api/repository/collections.get.ts`,
  `server/api/project/collections.get.ts` and `server/api/collection/like/counts.get.ts`.
- **Public API**: `api/src/lib/collections-db.ts`.
- **Worker**: `package_downloads_worker/src/repo/index.ts`, which selects `"insightsProjectId"`
  and `url` from `repositories` filtered on `"deletedAt" is null`. Those three column names are
  part of the contract.

To find every caller before a schema change, search for `cmDbPool` under `frontend/server`,
`getCmPool` under `api/src`, and `cmDbStore` under `workers/`.

### Tables insights writes

Only the Nuxt server writes.

| Table                         | Statements         |
| ----------------------------- | ------------------ |
| `collections`                 | `INSERT`, `UPDATE` |
| `collectionsInsightsProjects` | `INSERT`, `UPDATE` |
| `collectionsRepositories`     | `INSERT`, `UPDATE` |
| `collectionLikes`             | `INSERT`, `UPDATE` |
| `insightsSsoUsers`            | `INSERT`, `UPSERT` |

Community collections, collection likes and SSO user records are created by Insights and stored
in CDP's database. A CDP migration that renames or drops any of these tables or their columns
breaks Insights at runtime, and Insights has no migration of its own that would reveal it:
`database/migrations/` only covers the Insights database.

Insights' own Postgres is separate, reached through `getInsightsDbPool()` and the
`INSIGHTS_DB_*` variables. `chat`, events and security-audit data live there.

## 3. Tinybird

Both products read the same Tinybird workspace. Insights has two clients, each with its own
settings:

| Client      | Configuration                                                   |
| ----------- | --------------------------------------------------------------- |
| Nuxt server | `NUXT_TINYBIRD_BASE_URL`, `NUXT_TINYBIRD_TOKEN`                 |
| Public API  | `API_TB_HOST`, `API_TB_TOKEN`, in `api/src/clients/tinybird.ts` |

Moving or rotating the Tinybird connection means changing both sets.

Roughly thirty pipe endpoints under `/v0/pipes/` are referenced from `api/` and `libs/`,
including `activities_count`, `active_contributors`, `contributors_leaderboard`,
`contributor_retention`, `organizations_geo_distribution`, `collection_insights_aggregate`,
`categories_oss_index`, `package_metrics` and `median_time_to_review`.

A pipe is a contract: renaming one, changing its parameters, or changing the shape of its result
breaks the Insights endpoint that calls it. The datasources behind these pipes are fed from CDP
activity data, so a change to what CDP emits changes what Insights reports, without any code
change on this side.

## 4. Temporal

### Insights starts CDP workflows

The Nuxt server starts two workflows that run on CDP workers, defined in
`frontend/server/utils/temporal.ts`:

| Workflow                             | Task queue                | Arguments                                   | CDP worker                       | Started from                               |
| ------------------------------------ | ------------------------- | ------------------------------------------- | -------------------------------- | ------------------------------------------ |
| `upsertOSPSBaselineSecurityInsights` | `security-best-practices` | `IUpsertOSPSBaselineSecurityInsightsParams` | `security_best_practices_worker` | `server/api/security/update.post.ts`       |
| `processProjectDocsReadiness`        | `docs-readiness`          | `IProcessProjectDocsReadinessParams`        | `docs_readiness_worker`          | `server/api/docs-readiness/update.post.ts` |

The workflow names, task queues and argument shapes are a contract: Insights declares its own
copies of them, so a rename or a signature change on the CDP side compiles cleanly here and fails
only when a user triggers the route. The Nuxt client must also reach the namespace in which those
CDP workers poll.

### Payload codec

Payloads are encrypted, and the two sides must agree on the format. Insights workers use
`getDataConverter` from `@crowd/temporal`, so they share CDP's codec code. The Nuxt server does
not: `frontend/server/utils/temporal.ts` contains its own `EncryptionCodec` implementation, which
must stay wire-compatible with CDP's, including the `encryption-key-id` metadata key and the
encryption keys themselves. A change to CDP's codec will not show up as a diff on this side.

### Connection settings

Insights workers connect to one Temporal namespace, configured with `INSIGHTS_TEMPORAL_*`. The
`CROWD_TEMPORAL_*` variables also present in the worker environment are not a second connection:
`setBackwardCompatibleEnvVars()` in `workers/temporal/base/src/worker.ts` overwrites each of them
with the matching `INSIGHTS_TEMPORAL_*` value, because the `@crowd/*` libraries read the `CROWD_`
names.

## What counts as a breaking change for insights

On the CDP side:

- Any change to the symbols listed in section 1, including type signatures, or an incompatible
  change inside a package those symbols load at runtime.
- Renaming or dropping any table or column listed in section 2, or adding a `NOT NULL` column
  without a default to a table insights inserts into. Check all three consumers.
- Renaming a Tinybird pipe, changing its parameters, or changing its result shape.
- Renaming either workflow in section 4, moving it to another task queue, changing its
  arguments, or changing the payload codec or its key handling.
- Removing or renaming anything in the sparse list in `init-submodules.sh`, which would make the
  insights install fail outright.

On the insights side:

- Adding an import from a `@crowd/*` package outside the sparse list, which requires editing
  `init-submodules.sh` first.
- Writing to a CDP table not already listed in section 2, or adding a new component that
  connects to CDP's Postgres.
- Starting a further CDP workflow.

## Who to tell

There is no automated signal in either direction today. A CDP change in any of the categories
above should be raised with the Insights team before it merges, and an insights change that
widens the surface should be raised with the CDP team.

Naming an owner on each side is still open.

## Open questions

- Is the floating submodule resolution at deploy time intended, or should deploys use the
  recorded commit?
- Should the CDP tables insights writes move behind an API, or is shared ownership of those
  tables deliberate?
- Should the Nuxt server use CDP's codec from `@crowd/temporal` instead of its own copy?
- Who owns this contract on each side?
