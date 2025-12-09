# Development Metrics Explained

This section explains the development activity metrics tracked by LFX Insights. These metrics help assess <b>how actively and efficiently an open source project is being developed and maintained</b>.

:::info Please note
The Development metrics include actions performed by bots. We include bot activities because they often represent important automated processes in modern development workflows (such as automated testing, dependency updates, and CI/CD processes). Excluding these would result in incomplete data for development activity analysis. Bot actions are excluded from all other metric categories.
:::

## Issues Resolution

**What it is:** The number of issues opened, closed, and the average time it takes to resolve them.

**Why it matters:** Helps gauge how responsive and attentive maintainers are to user-reported problems and feature requests.

**Data Sources:** GitHub and GitLab.

## Commit Activities

**What it is:** The number of commits performed throughout time, including commits from the main branch and from pull requests.

**Why it matters:** Commit activity provides insight into the development pace and contributor engagement. Regular commit patterns indicate consistent development progress.

**Data Sources:** GitHub, GitLab and Git.

## Pull Requests

**What it is:** Metrics related to pull/merge requests (PRs), including how many are opened, closed, merged, and rejected.

**Why it matters:** Shows the pace of development and community contribution. A healthy volume of PRs indicates active collaboration and iteration.

**Data Sources:** GitHub and GitLab.

## Active Days

**What it is:** The number of days with at least one recorded development activity (e.g., commit, PR, issue).

**Why it matters:** Reveals how consistently a project is being maintained. More active days suggest ongoing and sustained development.

**Data Sources:** GitHub, GitLab, Git and Gerrit.

## Contributions Outside Work Hours

**What it is:** The percentage of contributions made outside standard weekday working hours.

**Why it matters:** Gives insight into contributor behavior—whether it's mostly hobbyist-driven or supported during work hours by employers. High off-hours activity may suggest volunteer-driven maintenance.

**Data Sources:** GitHub, GitLab, Git and Gerrit.

## Merge Lead Time

**What it is:** The average time between a pull request being opened and when it's merged.

**Why it matters:** Indicates how quickly contributions are reviewed and integrated. Shorter times often mean more responsive maintainers and faster iteration.

**Data Sources:** GitHub and GitLab.

## Review Time by Pull Request Size

**What it is:** The average review time categorized by the size (lines of code) of the pull request.

**Why it matters:** Helps evaluate how review complexity affects project responsiveness. Long review times on small PRs might signal process inefficiencies.

**Data Sources:** GitHub and GitLab.

## Code Review Engagement

**What it is:** Metrics that show how many reviewers are involved per PR and the overall level of code review activity.

**Why it matters:** Strong review engagement improves code quality, spreads knowledge across maintainers, and indicates healthy project governance.

**Data Sources:** GitHub and GitLab.

## Patchsets per review

**What it is:** The average and median number of code changes (patchsets) made to a changeset during the review process before it gets merged or abandoned.

**Why it matters:** Fewer patchsets per review suggest that contributors are submitting higher-quality initial code and that reviewers are providing clear feedback. High numbers may indicate unclear requirements, inadequate initial testing, or communication issues in the review process.

**Data Sources:** Gerrit.

## Median time to close

**What it is:** The middle value of time taken for changes (PRs, MRs or changesets) to be merged, which provides a more representative measure than average time by reducing the impact of outliers.

**Why it matters:** Median time to merge gives a realistic expectation for contributors about how long their contributions will take to be integrated. It's often more meaningful than average time because it's not skewed by exceptionally long or short merge times.

**Data Sources:** GitHub, GitLab and Gerrit.

## Median time to review

**What it is:** The middle value of time taken for changes (PRs, MRs or changesets) to receive their first review, providing a typical expectation for review response times.

**Why it matters:** This metric helps set realistic expectations for contributors and identifies potential bottlenecks in the review process. Consistent, reasonable median review times are crucial for maintaining contributor engagement and project momentum.

**Data Sources:** GitHub, GitLab and Gerrit.

## Review efficiency

**What it is:** A measure of how effectively the code review process operates, typically calculated as the ratio of closed reviews to total review cycles.

**Why it matters:** High review efficiency indicates a well-functioning development process where contributors submit quality code and reviewers provide clear, actionable feedback. This reduces back-and-forth cycles and accelerates development velocity.

**Data Sources:** GitHub, GitLab and Gerrit.