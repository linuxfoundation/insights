# Health Score Explained

LFX Insights surfaces **three independent assessments** for open source projects: a **Lifecycle state**, a **Health Score**, and an **Impact Score**. Together, these replace the previous single composite score and answer three distinct questions:

- **Lifecycle:** what state is this project in?
- **Health Score:** how well-maintained is it?
- **Impact Score:** how much does it matter if something goes wrong?

Separating health from impact means a popular but poorly maintained project can't score well, and a mature "done" library won't score poorly just for having few recent commits.

::: warning ⚠️ Please note
No score captures all the nuance of an open source project. Different projects serve different goals: some are mature and stable by design, others are experimental or niche. These assessments are meant to highlight signals and risks, not to make final judgments. Always consider context alongside the numbers.
:::

## The Three Assessments

| Assessment | Question answered | Output |
|---|---|---|
| **Lifecycle** | What state is this project in? | One of six states: Active, Stable, Declining, Inert, Abandoned, Archived |
| **Health Score** | How well-maintained is it? | 0–100, independent of popularity |
| **Impact Score** | How much does it matter if this breaks? | 0–100, based on dependency graph reach |

All three are shown together in the UI. When prioritizing stewardship, low Health combined with high Impact is the most urgent combination.

This methodology was developed with community input. You can read the full discussion and the feedback that shaped these decisions in [GitHub Discussion #1939](https://github.com/linuxfoundation/insights/discussions/1939).

## Lifecycle State

Look at the Lifecycle state before the numeric scores. It is derived from maintainer signals using a decision tree, not from the composite score itself.

### States

| State | What it means |
|---|---|
| **Active** | Does not meet criteria for any other state. Typically has recent commits and responsive maintainers, but no specific thresholds are required. |
| **Stable** | Low activity by design. The project is mature and does not need frequent changes. Maintainers are still reachable. |
| **Declining** | Activity dropped more than 50% in the last 6 months while issue volume increased; a sign the project is under pressure |
| **Inert** | No commits in 18+ months, but no open issues or pull requests either. Nothing to judge responsiveness by. A quiet project, not a neglected one. |
| **Abandoned** | No maintainer activity in 12+ months, with open issues or pull requests that have gone unanswered for an extended period |
| **Archived** | Explicitly archived in the repository host or marked deprecated in the package registry |

::: tip
"Silence alone is not abandonment — ignoring people is." A finished utility with no open issues, no CVEs, and no need for further development gets `Inert`, not `Abandoned`. The `Abandoned` state requires evidence of neglect: open items piling up while maintainers are absent. This distinction came directly from community feedback on the methodology.
:::

### Classification Rules

The lifecycle state is assigned by evaluating the following conditions in order. The first match wins:

1. **Archived:** the repository's archived flag is set, or the package registry marks the package as deprecated or yanked.
2. **Abandoned:** open issues or pull requests have received no non-author response for an extended period (90 to 180 days), and maintainers have had no activity in the last 12 months.
3. **Inert:** no commits in the last 18 months, and no open issues or pull requests in that window (nothing to judge responsiveness by).
4. **Declining:** commits in the last 6 months are less than 50% of the prior 6 months, and the volume of newly opened issues is higher than the prior period.
5. **Stable:** the latest release is within the last 12 months, fewer than 50 issues are open, no critical vulnerabilities are open, and commits have dropped more than 50% vs. the prior period.
6. **Active:** all other projects.

For multi-repo projects, the project takes the best state across all its repositories: Active beats Stable, Stable beats Declining, and so on down to Archived.

## Health Score (0–100)

The Health Score measures how well-maintained a project is, independent of how popular or critical it is. A widely-used project with poor maintainer responsiveness will score low here, even if its Impact Score is high.

**Health Score (0–100) = Maintainer Health (0–40 pts) + Security and Supply Chain (0–35 pts) + Development Activity (0–25 pts)**

### Rating Bands

| Score | Label | What it signals |
|---|---|---|
| 85–100 | **Excellent** | Well-maintained, secure, active or intentionally stable |
| 70–84 | **Healthy** | In good shape with minor gaps |
| 50–69 | **Fair** | Some concerning signals; may need attention |
| 30–49 | **Concerning** | Multiple risk signals; stewardship candidate |
| 0–29 | **Critical** | Serious gaps; likely needs intervention |

### 1. Maintainer Health (0–40 pts)

A project with responsive maintainers will fix CVEs, clear backlogs, and ship fixes. Without them, the other signals are just a timer.

#### 1.1 Maintainer Responsiveness (max 15 pts)

Measures the median time for a non-author to respond to newly opened issues and pull requests. Bot and automation activity is excluded so only genuine human responses count.

- **15 pts:** Median response time under 7 days
- **10 pts:** Median response time under 30 days
- **5 pts:** Median response time under 90 days
- **0 pts:** Median response time 90 days or more, or no response data available

Projects with no open issues or pull requests in the measurement window have no response data. This sub-signal is scored as 0 pts (not redistributed), because the signal is available — there is simply no activity to measure.

#### 1.2 Bus Factor (max 18 pts)

Counts the number of people who are actively maintaining the project, taking the higher of two sources: the official maintainer roster and the set of people observably performing review and merge actions in the last 12 months. This corrects for curated rosters that undercount large, community-maintained projects.

- **18 pts:** 5 or more active maintainers
- **15 pts:** 3 or 4 active maintainers
- **6 pts:** 2 active maintainers
- **3 pts:** 1 active maintainer
- **0 pts:** No active maintainers

#### 1.3 Organizational Diversity (max 7 pts)

Measures how many distinct organizations the active maintainers are affiliated with, using contributor affiliation data. Projects maintained by contributors from multiple independent organizations are more resilient to any single organization withdrawing support.

- **7 pts:** Maintainers from 3 or more organizations
- **4 pts:** Maintainers from 2 organizations
- **2 pts:** All maintainers from 1 organization
- **0 pts:** Affiliation unknown

### 2. Security and Supply Chain (0–35 pts)

A project's security posture depends on both what it ships and how it is built. This category measures known vulnerabilities, documented security practices, supply chain integrity, and the health of the project's own dependencies.

#### 2.1 Open Vulnerabilities (max 10 pts)

Counts unresolved security advisories scoped to the repository, sourced from OSV and GHSA. Points are deducted by severity:

- **10 pts:** No open vulnerabilities
- Points deducted per open advisory: 6 per Critical, 3 per High, 1 per Moderate (minimum 0)

If no vulnerability scan has been completed for the repository, this sub-signal is unavailable and its weight redistributes to other Security sub-signals.

#### 2.2 Security Practices (max 8 pts)

Checks whether the repository has adopted documented security practices:

- **2 pts:** `SECURITY.md` file present
- **2 pts:** Branch protection enabled on the default branch
- **2 pts:** Required code reviews on pull requests
- **2 pts:** Required status checks before merging

::: info
Security practices are currently evaluated for GitHub repositories only. GitLab and Gerrit repositories have this sub-signal blocked; its weight redistributes to other available Security sub-signals.
:::

#### 2.3 OpenSSF Scorecard (max 7 pts)

Normalized from the OpenSSF Scorecard's 0–10 scale. Currently available for GitHub-hosted repositories only. GitLab and Gerrit repositories have this sub-signal blocked, and its weight redistributes within the Security category.

#### 2.4 Dependency Health (max 5 pts)

Evaluates the security posture of the project's direct dependencies:

- **5 pts:** No direct dependencies with known high or critical vulnerabilities
- **3 pts:** 1 or 2 vulnerable dependencies
- **1 pt:** 3 to 5 vulnerable dependencies
- **0 pts:** More than 5 vulnerable dependencies

Available only for repositories that publish tracked packages. Repositories without published packages have this sub-signal blocked.

#### 2.5 Supply Chain Integrity (max 5 pts)

Assesses build provenance attestation, artifact-to-repository consistency, and publisher account security. This sub-signal is in development and is currently blocked for all projects. Its weight redistributes to available Security sub-signals; projects are not penalized.

### 3. Development Activity (0–25 pts)

A finished library with no open issues, no CVEs, and a recent release can score well here without recent commits. Intentionally low-activity projects are not penalized.

#### 3.1 Release Cadence (max 8 pts)

Measures how recently and regularly the project has published releases. Counted over distinct release days to prevent burst-publishing in monorepos from inflating the score.

- **8 pts:** Latest release within 90 days and consistent cadence (releases at least every 90 days)
- **6 pts:** Latest release within 180 days
- **4 pts:** Latest release within 1 year
- **2 pts:** Latest release within 2 years
- **0 pts:** No release in over 2 years, or no releases tracked

Available only for repositories that publish tracked packages. Repositories without published packages have this sub-signal blocked.

#### 3.2 Commit Activity (max 5 pts)

Counts commits authored in the last 6 months on the cleaned activity stream (bots and automation excluded).

- **5 pts:** 50 or more commits
- **4 pts:** 20 to 49 commits
- **3 pts:** 5 to 19 commits
- **1 pt:** 1 to 4 commits
- **0 pts:** No commits

#### 3.3 Issue Resolution (max 7 pts)

Combines two independent measures over the last 12 months: how many issues were resolved, and how quickly. Only non-bot activity is included. Points from each component are added together.

**Close ratio** (max 4 pts) — issues closed relative to issues opened:

- **4 pts:** 80% or more of opened issues were closed
- **2 pts:** 50% or more of opened issues were closed
- **0 pts:** Fewer than 50% closed, or no issues in the period

**Median time to close** (max 3 pts):

- **3 pts:** Median close time under 7 days
- **2 pts:** Median close time under 30 days
- **0 pts:** 30 days or more, or no closed issues in the period

Gerrit repositories do not ingest issue data. This sub-signal is blocked for Gerrit-only projects and its weight redistributes within Development Activity.

#### 3.4 PR Merge Health (max 5 pts)

Combines two independent measures over the last 12 months: what fraction of pull requests were merged rather than abandoned, and how quickly. Points from each component are added together.

**Merge ratio** (max 3 pts) — merged pull requests relative to all closed pull requests:

- **3 pts:** 70% or more of closed pull requests were merged
- **1 pt:** 40% or more of closed pull requests were merged
- **0 pts:** Fewer than 40% merged, or no closed pull requests in the period

**Median time to merge** (max 2 pts):

- **2 pts:** Median merge time under 7 days
- **1 pt:** Median merge time under 30 days
- **0 pts:** 30 days or more, or no merged pull requests in the period

Gerrit repositories do not ingest pull request data. This sub-signal is blocked for Gerrit-only projects and its weight redistributes within Development Activity.

### Handling Missing Data

Not every signal is available for every project. Insights uses two layers of redistribution so projects aren't penalized for gaps in data coverage.

**Layer 1, sub-signal blocked:** if a specific sub-signal cannot be computed (for example, OpenSSF Scorecard is unavailable for a GitLab repository), the missing points are redistributed proportionally to the other available sub-signals in the same category. The category's maximum is preserved.

**Layer 2, category unavailable:** if fewer than 40% of a category's maximum points are covered by available sub-signals, the entire category is marked unavailable and dropped from the composite. The remaining available categories rescale to fill 100 points.

If all three categories fall below the 40% coverage threshold, the Health Score itself is emitted as `unavailable`, never as a zero or blank. This way you can always distinguish "we could not measure this" from "this project scored poorly."

## Impact Score (0–100)

The Impact Score answers: how bad is it if this breaks? It is independent of the Health Score. A healthy project can have low impact; an unhealthy project can have high impact.

The score is package-mediated. A project's Impact Score is the highest impact score across all packages it publishes. This reflects blast radius: a project's potential for damage if it fails equals its most widely depended-upon package.

Projects that do not publish any tracked packages do not receive an Impact Score. This includes documentation sites, community landing pages, and projects that ship binaries rather than registry packages.

### Impact Bands

| Score | Label | What it signals |
|---|---|---|
| 85–100 | **Foundational** | Extremely broad transitive reach; failure would affect a significant portion of the ecosystem |
| 60–84 | **Major** | High dependency graph presence; widely used directly or indirectly |
| 30–59 | **Moderate** | Significant reach within a narrower part of the ecosystem |
| 0–29 | **Minor** | Limited dependency footprint |

### Signals

| Signal | What it captures |
|---|---|
| **Transitive dependents** | All packages that depend on this project directly or indirectly. The core blast-radius measure. |
| **Direct dependents** | First-degree dependent count. Included alongside transitive reach to capture direct adoption. |
| **Downloads** | Per-registry download counts. A proxy for real-world usage. Where raw counts are unavailable (for example, Maven), an ecosystem-provided popularity score is used instead. |

### Methodology

Impact is computed in two steps:

1. **Score each signal relative to the ecosystem:** for each signal, a package's contribution is measured as its cumulative share of the total ecosystem signal. Packages at the top of each distribution score near 1; the long tail scores near 0. Signals with no data for a given ecosystem are excluded.
2. **Average across available signals**, then scaled to 0–100. Packages are not penalized when a specific signal is unavailable for their ecosystem.

## Multi-Repo Projects

An Insights project can span multiple repositories. Sub-signals are computed per repository, then rolled up to the project level:

- **Health Score and sub-scores:** straight mean across all active, non-excluded repositories.
- **Lifecycle state:** best-state-wins. One active repository makes the project active, regardless of the state of other repositories.
- **Impact Score:** the highest impact score across all packages published by any repository in the project.

Repositories marked as excluded (for example, experimental sandbox repos) are not included in scoring. This prevents an inactive experimental repository from dragging down a project's Health Score.

## Platform and Data Coverage

Insights collects data from GitHub, GitLab, and Gerrit. Not all signals are available on every platform, and not all projects publish tracked packages.

**GitLab projects:**

Security practices and OpenSSF Scorecard are currently GitHub-only. GitLab projects will typically have these sub-signals blocked and absorbed by Layer-1 redistribution or, if Security coverage falls below 40%, the entire Security category may be marked unavailable. Health Score still computes from Maintainer Health and Development Activity. Broader security signal coverage for GitLab is in development.

**Gerrit projects:**

Gerrit does not ingest issue or PR data in the same format as GitHub and GitLab. Issue Resolution, PR Merge Health, and Security Practices are typically blocked. Commit Activity and Bus Factor remain available. Development Activity may compute from a reduced set of sub-signals.

**Projects without published packages:**

Release Cadence, Dependency Health, and Supply Chain Integrity are all package-mediated signals. Projects that do not publish to a tracked registry (npm, PyPI, Maven, and others) will have these sub-signals blocked. Their weight redistributes to the signals that are available. Impact Score will not be shown for these projects.

**Projects with partial data across repos:**

For multi-repo projects, sub-signals in a `partial` coverage state are computed over the subset of repositories where data is available. The score reflects what can be observed, and the coverage detail is available in the UI for transparency.

::: info
Health Score comparisons across projects with different platform or data coverage are not directly comparable. A project with full GitHub and package data is scored on more signals than one on Gerrit with no published packages. Coverage details are always shown alongside the score.
:::

## Bot and Non-Human Activity

All time-based and activity-count signals (responsiveness, commit counts, issue metrics, PR metrics, bus factor recency) are computed from the cleaned activity stream, which excludes bots, team accounts, and organization accounts identified through contributor enrichment. This prevents automated issue floods or bot-authored PRs from distorting responsiveness or resolution metrics.

## How This Differs from the Previous Health Score

::: info
The original Insights Health Score was a single 0–100 value, computed as an equal-weight mean of four sub-scores: Contributors (25 pts), Popularity (25 pts), Development (25 pts), and Security and Best Practices (25 pts). The current methodology replaces that with three independent assessments and re-weighted health categories.
:::

| Aspect | Original Health Score | Current methodology |
|---|---|---|
| **Output** | Single score (0–100) | Three assessments: Lifecycle (state), Health Score (0–100), Impact Score (0–100) |
| **Health categories** | 4 equal categories at 25 pts each | 3 weighted categories: Maintainer (40), Security and Supply Chain (35), Development Activity (25) |
| **Popularity** | Baked into Health Score as 25% of the total | Separate Impact Score; does not affect Health |
| **Lifecycle** | Not modeled | Six states: Active, Stable, Declining, Inert, Abandoned, Archived |
| **Stable "done" libraries** | Penalized: low commits meant a low score | Not penalized: the Stable state recognizes intentionally low-activity projects |
| **Maintainer signal** | Contributor count only | Responsiveness, bus factor (curated plus observed), organizational diversity |
| **Security** | OpenSSF Baseline pass/fail ratio | Open CVEs with severity weighting, security practices, OpenSSF Scorecard, dependency health, supply chain integrity |
| **Missing data** | Returned unavailable if any sub-score was absent | Two-layer redistribution: blocked sub-signals rescale within their category; scores are only marked unavailable when signal floor is too low to be defensible |
| **Rating bands** | Excellent / Healthy / Stable / Unsteady / Critical | Excellent / Healthy / Fair / Concerning / Critical |

### Why the original approach had gaps

The previous model had several structural problems:

- **Equal weighting ignored blast radius.** A project with a single maintainer and a critical open CVE could score the same as a project with ten maintainers and a clean security record, if their activity levels were similar.
- **Popularity baked into health.** A massively downloaded project with a compromised or absent maintainer appeared healthy because download counts inflated the score.
- **Stable libraries were penalized.** A mature utility with no bugs, no CVEs, and no need for active development scored near Critical simply because it had few recent commits.
- **No lifecycle signal.** The model could not distinguish "abandoned with a high score" from "active with a high score," a critical difference for stewardship and dependency risk.
- **Any missing sub-score returned unavailable.** Projects on GitLab or Gerrit, or projects without package data, often could not be scored at all.
