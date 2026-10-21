# Cross-repo contract: insights and crowd.dev

LFX Insights depends on the Community Data Platform (CDP, `CrowdDotDev/crowd.dev`) across four
surfaces. None of them is a versioned API. This page records what the two repositories actually
share, so a change on either side can be made deliberately rather than discovered in production.

Insights owns this page because it owns the submodule pin, the sparse checkout, the init script
and the deploy workflows, and because breakage lands here first.

| Surface             | Direction                         | Coupling                        |
| ------------------- | --------------------------------- | ------------------------------- |
| Shared library code | insights imports from CDP         | Source, through a git submodule |
| CDP Postgres        | insights reads **and writes**     | Direct SQL, no API in between   |
| Tinybird            | both query the same workspace     | Named pipe endpoints            |
| Temporal            | separate namespaces, shared codec | Config and encryption keys      |

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

### What is actually imported

The sparse list is much wider than the real coupling. Only `workers/` imports `@crowd/*`;
`api/`, `frontend/` and `libs/` import none of it. The entire imported surface:

| Package                     | Symbols                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `@crowd/archetype-standard` | `Config`, `Service`                                          |
| `@crowd/database`           | `DbStore`, `getDbConnection`                                 |
| `@crowd/logging`            | `Logger`, `LogLevel`, `getServiceChildLogger`                |
| `@crowd/telemetry`          | default export                                               |
| `@crowd/temporal`           | `getDataConverter`                                           |
| `@crowd/slack`              | `SlackChannel`, `SlackPersona`, `sendSlackNotificationAsync` |

`@crowd/common`, `@crowd/types`, `@crowd/opensearch`, `@crowd/queue` and `@crowd/redis` are
declared as dependencies of worker packages but imported nowhere in insights source. They are
reachable transitively through the archetype; treat them as build-time requirements rather than
part of the contract.

A change to any symbol in that table is a breaking change for insights.

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
no API between them, and the access is not read-only.

Two components hold that connection:

- **The Nuxt server.** `frontend/server/middleware/database.ts` puts a `cmDbPool` on the request
  context, from `getCMDbPool()` in `frontend/server/utils/db.ts`. It is gated by
  `NUXT_CM_DB_ENABLED` and on by default in production. Configuration lives in
  `frontend/setup/runtime-config.ts` under the `cmDb*` keys; the local default database name is
  `crowd-web`.
- **`package_downloads_worker`.** `workers/temporal/base/src/worker.ts` exposes a `cm` Postgres
  option, configured from `CM_DB_READ_HOST`, `CM_DB_WRITE_HOST`, `CM_DB_PORT`, `CM_DB_USERNAME`,
  `CM_DB_PASSWORD` and `CM_DB_DATABASE`. Of the three Temporal workers, only
  `package_downloads_worker` sets `cm.enabled: true`.

### Tables insights reads

| Table                         | Read by                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `collections`                 | `communityCollection.repo.ts`                             |
| `collectionsInsightsProjects` | `communityCollection.repo.ts`, `collectionLike.repo.ts`   |
| `collectionsRepositories`     | `communityCollection.repo.ts`, `collectionLike.repo.ts`   |
| `collectionLikes`             | `communityCollection.repo.ts`, `collectionLike.repo.ts`   |
| `insightsProjects`            | `communityCollection.repo.ts`, `insightsProjects.repo.ts` |
| `insightsSsoUsers`            | `insightsSsoUser.repo.ts`                                 |
| `repositories`                | `communityCollection.repo.ts`, `package_downloads_worker` |

`package_downloads_worker` selects `"insightsProjectId"` and `url` from `repositories`, filtered
on `"deletedAt" is null`. Those three column names are part of the contract.

### Tables insights writes

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

Both products read the same Tinybird workspace. Insights queries named pipe endpoints under
`/v0/pipes/` through `libs/tinybird-client`, configured with `NUXT_TINYBIRD_BASE_URL` and
`NUXT_TINYBIRD_TOKEN`.

Roughly thirty endpoints are referenced from `api/` and `libs/`, including `activities_count`,
`active_contributors`, `contributors_leaderboard`, `contributor_retention`,
`organizations_geo_distribution`, `collection_insights_aggregate`, `categories_oss_index`,
`package_metrics` and `median_time_to_review`.

A pipe is a contract: renaming one, changing its parameters, or changing the shape of its result
breaks the Insights endpoint that calls it. The datasources behind these pipes are fed from CDP
activity data, so a change to what CDP emits changes what Insights reports, without any code
change on this side.

## 4. Temporal

The two products run separate Temporal namespaces, configured through `INSIGHTS_TEMPORAL_*` on
this side and `CROWD_TEMPORAL_*` for the CDP connection. Both sets appear in the worker
environment.

Insights workers build their data converter with `getDataConverter` from `@crowd/temporal`, so
the payload codec and the encryption key handling are shared code. A change to that converter
affects both products' workers.

## What counts as a breaking change for insights

On the CDP side:

- Any change to the symbols listed in section 1, including type signatures.
- Renaming or dropping any table or column listed in section 2, or adding a `NOT NULL` column
  without a default to a table insights inserts into.
- Renaming a Tinybird pipe, changing its parameters, or changing its result shape.
- A change to the Temporal data converter or its encryption key handling.
- Removing or renaming anything in the sparse list in `init-submodules.sh`, which would make the
  insights install fail outright.

On the insights side:

- Adding an import from a `@crowd/*` package outside the sparse list, which requires editing
  `init-submodules.sh` first.
- Writing to a CDP table not already listed in section 2.

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
- Who owns this contract on each side?
