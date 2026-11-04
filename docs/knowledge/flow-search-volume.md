---
type: data-flow
slug: flow-search-volume
name: Project search volume
repo: insights
owner: Insights team
depends_on: [sys-insights, contract-insights-cdp]
used_by: []
sources:
  - workers/temporal/search_volume_worker/
  - database/migrations/V2__Create_search_volume_table.sql
  - database/migrations/V1752513036__renameSearchVolumeSlugToProject.sql
  - frontend/server/data/tinybird/popularity/search-queries.ts
  - frontend/server/api/widget/popularity/search-queries.get.ts
  - frontend/server/helpers/health-score.helpers.ts
  - api/src/versions/v1-alpha/popularity/search-queries.ts
---

# Project search volume

The Search Queries widget on a project's Popularity page shows how many Google searches the
project's name gets each month. Insights collects the numbers once a month from the Keywords
Everywhere API, stores them in the Insights Postgres, and serves them from Tinybird.

## Parts that take part

| Part                                  | Where                                                        | Role                                                       |
| ------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `search_volume_worker`                | `workers/temporal/search_volume_worker/`                     | Registers the schedule, runs the workflow, writes Postgres |
| Keywords Everywhere API               | `src/search-volume/keywords-everywhere.ts`                   | Returns the monthly trend per keyword                      |
| Tinybird `projects_list` pipe         | read in `src/search-volume/tinybird.ts`                      | The list of projects to look up                            |
| Insights Postgres `search_volume`     | `database/migrations/`                                       | One row per project, keyword and month                     |
| Tinybird `searchVolume` datasource    | crowd.dev, `services/libs/tinybird/datasources/`             | The replicated copy of `search_volume`                     |
| Tinybird `search_volume` pipe         | crowd.dev, `services/libs/tinybird/pipes/search_volume.pipe` | Serves the widget and the public API                       |
| Tinybird `health_score_search_volume` | crowd.dev, `services/libs/tinybird/pipes/`                   | Feeds the popularity part of the health score              |

The worker opens only the Insights Postgres connection (`cm.enabled: false` in `src/main.ts`), so
it does not touch CDP's database. It needs `NUXT_TINYBIRD_TOKEN` and `KEYWORDS_EVERYWHERE_API_KEY`;
both are listed in `.env.dist`.

## Trigger

`src/schedules/monthlySearchVolumeUpdate.ts` registers the Temporal schedule
`scheduleMonthlySearchVolumeUpdate` when the worker starts. It runs
`monthlySearchVolumeUpdateWorkflow` on the `search-volume` task queue at 03:17 UTC on the first day
of every month, with up to three workflow attempts. If the schedule already exists, the worker
logs a message and leaves it as it is, so a change to the schedule in code does not reach an
existing schedule on its own.

The workflow runs one activity, `runMonthlySearchVolumeUpdate`, with a five-minute start-to-close
timeout and up to three attempts. The schedule passes no filters, so every run covers every
project.

## What a run does

The logic is in `src/search-volume/search-volume.ts`.

1. Reads `projects_list` from Tinybird a page at a time, 1,000 projects per page by default.
2. Uses each project's slug as the search keyword. Projects with an empty slug are skipped, and
   projects that share a slug share one lookup.
3. Sends the page's keywords to Keywords Everywhere in one request, for the United States, in
   USD, from Google Keyword Planner data (`dataSource: gkp`).
4. Sorts each keyword's `trend` array by month and turns each month into a date on the first day
   of that month.
5. Upserts one row per project and month into `search_volume`, keyed on
   `(insights_project_id, project, data_timestamp)`, so a later run overwrites the volume for a
   month it has already stored.

If the Keywords Everywhere call fails, the worker logs the error and stores nothing for that page,
and the run carries on with the next page. A row that fails to insert is logged and counted; the
rest of the page is still written.

`ISearchVolumeParams` also accepts `keyword` (one slug) and `limit` for a run started by hand.
The filters apply to each page: `limit` selects up to N Linux Foundation projects plus the top N
other projects by rank on that page. The run stops when a page selects nothing or fewer projects
than a full page. A `keyword` run therefore stops at the first page that lacks the slug, while a
large `limit` can carry the run across every page and spend more Keywords Everywhere credits than
expected.

## Tables and datasources

- **Insights Postgres `search_volume`**: `insights_project_id`, `project` (the keyword),
  `data_timestamp` (first day of the month), `volume`, `updated_at`. Created by
  `V2__Create_search_volume_table.sql`; the keyword column was renamed from `slug` to `project`
  in `V1752513036__renameSearchVolumeSlugToProject.sql`.
- **Tinybird `searchVolume`**: a `ReplacingMergeTree` on `project` and `dataTimestamp`, versioned
  by `updatedAt`. Its schema reads the `record` envelope that Sequin produces from Postgres
  changes.

## What depends on it

- **Search Queries widget**: `frontend/server/api/widget/popularity/search-queries.get.ts` calls
  `fetchSearchVolume()` in `frontend/server/data/tinybird/popularity/search-queries.ts`, which
  reads the `search_volume` pipe. For a collection, the pipe adds up the volumes of every project
  in the collection per month.
- **Public API**: `GET popularity/search-queries` in
  `api/src/versions/v1-alpha/popularity/search-queries.ts` reads the same pipe.
- **Health score**: `health_score_search_volume` averages the volume over the last 365 days and
  maps it to a 0 to 5 benchmark (0 to 9 searches a month is 0, 1,000 or more is 5).
  `health_score_copy` counts it in the popularity score only when the project has the
  `searchQueries` widget and the average is above zero. `frontend/server/helpers/health-score.helpers.ts`
  reads it as `searchVolumeAverage` and `searchVolumeBenchmark`.

A change to the `search_volume` columns has to be matched in the `searchVolume` datasource in
crowd.dev, or new rows go to Tinybird quarantine.

## Where to look

- The schedule, workflow and activity: `workers/temporal/search_volume_worker/src/`.
- Deployment: the `search-volume-worker` option of the manual deploy workflows, described in
  [`sys-insights.md`](sys-insights.md).
- How Insights shares Tinybird with CDP, including the worker's `NUXT_TINYBIRD_*` settings:
  [`cross-repo-contract.md`](cross-repo-contract.md).
- The visitor-facing explanation of the metric: `frontend/docs/metrics/popularity/index.md`.
