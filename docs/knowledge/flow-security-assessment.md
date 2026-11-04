---
type: data-flow
slug: flow-security-assessment
name: Security and best practices assessment
repo: insights
owner: Insights team
depends_on: [sys-insights, contract-insights-cdp, sys-cdp]
used_by: []
sources:
  - frontend/server/api/security/update.post.ts
  - frontend/server/api/project/[slug]/security/assessment.ts
  - frontend/server/utils/temporal.ts
  - frontend/server/middleware/jwt-auth.ts
  - frontend/server/helpers/health-score.helpers.ts
  - frontend/app/components/modules/project/views/security.vue
  - frontend/app/components/modules/project/services/security.service.ts
  - frontend/app/components/modules/project/services/security.api.service.ts
  - frontend/app/components/modules/project/components/security/control-assessment-head.vue
  - api/src/versions/v1-alpha/security/assessment.ts
---

# Security and best practices assessment

The Controls Assessment on a project's Security page shows how each GitHub repository does
against the OpenSSF Open Source Project Security Baseline (OSPS Baseline). CDP runs the checks and
stores the results; Insights reads them from Tinybird and can ask CDP to re-run them for one
repository.

## Parts that take part

| Part                                     | Where                                                                                           | Role                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `security_best_practices_worker`         | crowd.dev, `services/apps/security_best_practices_worker/`                                      | Schedules and runs the assessments, writes CDP Postgres |
| Privateer and `pvtr-github-repo-scanner` | crowd.dev, `scripts/services/docker/Dockerfile.security_best_practices_worker`                  | The CLI and the GitHub plugin that run the checks       |
| Data access                              | crowd.dev, `services/libs/data-access-layer/src/security_insights/`                             | Picks repositories and writes the results               |
| Tinybird pipes                           | crowd.dev, `services/libs/tinybird/pipes/`                                                      | Deduplicate, categorise and serve the results           |
| Insights Nuxt server                     | `frontend/server/api/security/` and `frontend/server/api/project/[slug]/security/assessment.ts` | Starts a re-run; reads results for the page             |
| Insights public API                      | `api/src/versions/v1-alpha/security/assessment.ts`                                              | Serves the results to API users                         |

## How a repository is assessed

The worker's image bundles the Privateer CLI and the `github-repo` plugin, built from a pinned
commit of [`ossf/pvtr-github-repo-scanner`](https://github.com/ossf/pvtr-github-repo-scanner).
For each repository, `getOSPSBaselineInsights()` fills in `example-config.yml` with the owner,
repository name and a GitHub token, and runs Privateer. The config selects the
`osps-baseline-2026-02` catalog and only its Maturity Level 1 requirements. The worker does not
clone or build the repository; the plugin decides how each requirement is checked.

Privateer writes a YAML report. The worker keeps it in Redis for a day, then
`saveOSPSBaselineInsightsToDB()` stores the evaluation suite for that catalog, one evaluation per
control and one assessment per requirement, with the result, message and recommendation the
plugin returned. Exit codes 0 and 1 both count as a completed run; any other exit code, or a
missing report, fails the run for that repository.

## Triggers

**Daily schedule.** The worker registers the Temporal schedule
`triggerSecurityInsightsCheckForRepos`, which runs every day at 08:00 UTC on the
`security-best-practices` task queue. `findObsoleteReposQx()` selects repositories that:

- belong to an Insights project,
- are not deleted and not marked `excluded`,
- have a URL starting with `https://github.com`, and
- have no evaluation suite updated in the last 30 days, including repositories never assessed.

Each batch takes 100 repositories and runs up to five `upsertOSPSBaselineSecurityInsights` child
workflows at a time, then continues as new until nothing is left. Tokens come from the pool in
`CROWD_GITHUB_PERSONAL_ACCESS_TOKENS`. A rate-limited token rests for an hour and an invalid one
is dropped; the child is retried with another token. A repository that fails for another reason is
skipped for the rest of that run and picked up again on a later day. When no token is free, the
run stops and the remaining repositories wait for the next day.

A repository added to a project is therefore assessed at the next daily run, and every
repository is re-assessed about every 30 days.

**Update results button.** On a single-repository view, a signed-in user sees an Update results
button (`control-assessment-head.vue`). It posts to `/api/security/update`, which
`server/middleware/jwt-auth.ts` protects. The route checks through `projects_list` that the
repository belongs to the project, then starts `upsertOSPSBaselineSecurityInsights` directly on
CDP's worker with the server's own token (the `securityGithubToken` runtime config key). The
workflow ID is `security-update-<slug>-<repo>`, so a second click while a run is in progress gets
a 429. This path uses that one token, with no fallback to the pool. The workflow name, queue,
arguments and payload codec are part of the seam described in section 4 of
[`cross-repo-contract.md`](cross-repo-contract.md).

## Tables and datasources

In CDP Postgres:

- `securityInsightsEvaluationSuites`: one row per repository and catalog. Its `updatedAt` decides
  when a repository is due again.
- `securityInsightsEvaluations`: one row per control, upserted on suite, repository and control.
- `securityInsightsEvaluationAssessments`: one row per requirement, upserted on evaluation,
  repository and requirement, so a rerun overwrites the previous result and no history is kept.

The last two are in the `sequin_pub` publication and reach Tinybird as the
`securityInsightsEvaluations` and `securityInsightsEvaluationAssessments` datasources. The
assessments datasource keeps the latest row per project, repository and requirement.

`security_deduplicated_merged_copy_pipe` runs every hour, at three minutes past, and replaces
`security_deduplicated_merged_ds`. It drops results marked `Not Run`, groups each control's
requirements together and assigns each control one of eight categories: Access Control, Build and
Release, Documentation, Governance, Legal, Quality, Security Assessment and Vulnerability
Management. A finished run therefore reaches Tinybird within about an hour, which is what the
button's message tells the user. The page can take longer: in production the per-project security
reads stay in the one-hour Redis route cache (see [`flow-caching.md`](flow-caching.md)), and an
expired entry is served once more while it refreshes.

## What depends on it

- **Security page**: `frontend/server/api/project/[slug]/security/assessment.ts` reads the
  `security_and_best_practices` pipe, limited to the project's enabled repositories and any
  selected ones. `security.vue` shows the assessment only for projects with a GitHub platform
  connected. `removeUnavailableChecks()` in `security.service.ts` hides the `OSPS-AC-01` control
  and the Documentation and Vulnerability Management categories.
- **Public API**: `api/src/versions/v1-alpha/security/assessment.ts` reads the same pipe and
  returns every category, including the two the page hides.
- **Health score**: `health_score_security` and `repo_health_score_security` compute a pass rate
  per category from `security_deduplicated_merged_ds`, leaving out requirement `OSPS-AC-01.01`
  and the Documentation and Vulnerability Management categories. `health_score_copy` stores it
  as `securityPercentage` and `securityCategoryPercentage`, which
  `frontend/server/helpers/health-score.helpers.ts` reads. The v2 health score's Security
  category uses other signals and does not read these results.

## Questions about results

- **Why is there no assessment for a repository?** Only GitHub repositories are assessed, and a
  repository marked `excluded` is skipped. A new repository waits for the next daily run. A run
  can also fail for one repository, for example when the plugin exits with an error or GitHub
  refuses the token; the repository is retried on a later day.
- **Why does a check fail when the project meets it?** How a requirement is checked, and where
  the plugin looks for evidence, is defined in `pvtr-github-repo-scanner`, not in CDP or
  Insights. The plugin's message and recommendation for each requirement are shown as returned.
  Questions about a specific check belong in that repository's issues.
- **Why are some controls missing?** The page hides controls that need privileged access to the
  organization, such as the multi-factor authentication check in `OSPS-AC-01`, and the
  Documentation and Vulnerability Management categories. The public API still returns them.
- **Are archived repositories counted?** Yes. The scheduled run, the Tinybird pipes and the
  OSPS-based health score do not filter on `archived`; only `excluded` repositories are skipped.
- **Why do results differ from other tools, such as CLOMonitor?** Insights reports only what this
  plugin returns for Maturity Level 1 of the `osps-baseline-2026-02` catalog. Other tools run
  their own checks.
- **Can maintainers run the checks themselves?** Yes: the Privateer CLI with the `github-repo`
  plugin and a config like the worker's `example-config.yml` runs the same checks locally. The plugin version the worker pins is in its Dockerfile.

## Where to look

- Worker, schedule and workflows: crowd.dev, `services/apps/security_best_practices_worker/src/`.
- Plugin and CLI versions: crowd.dev,
  `scripts/services/docker/Dockerfile.security_best_practices_worker`.
- Which repositories are due: `findObsoleteReposQx()` in crowd.dev,
  `services/libs/data-access-layer/src/security_insights/index.ts`.
- Results served to the page: crowd.dev, `services/libs/tinybird/pipes/security_and_best_practices.pipe`.
- The trigger seam between the two repositories: [`cross-repo-contract.md`](cross-repo-contract.md).
- The visitor-facing explanation: `frontend/docs/metrics/security/index.md`.
