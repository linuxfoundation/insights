# LF Open Source Index

How we define which projects are included in Insights.

## What is the LF Open Source Index?
The LF Open Source Index is a curated view of the most critical open source projects powering our modern digital infrastructure. It defines the scope of projects shown in LFX Insights, helping developers, maintainers, and organizations understand what’s truly foundational to the open source ecosystem.

## Which projects are included
At its core, the LF Open Source Index (and therefore Insights) includes:

- **All Linux Foundation-hosted projects**, across all Linux Foundation (LF) initiatives and foundations - see [here](https://www.linuxfoundation.org/projects/).
- **Critical non-LF projects** that are widely adopted and essential to a global developer audience.

We aim to cover projects that are not just active, but impactful and deeply integrated into the technology stack of the modern world.

## How we define "critical" projects

To identify critical open source projects outside of the LF, we rely on the [OpenSSF Criticality Score](https://github.com/ossf/criticality_score) — an open-source metric that evaluates projects based on:

- GitHub activity and contributor base
- Project dependencies
- Popularity indicators (e.g., stars, forks)
- Community responsiveness and velocity

### Criticality Score 
The **Criticality Score** is a metric presented in LFX Insights for the selected open source projects to indicate their relative importance and impact on the broader open source ecosystem.

The **Criticality Score** quantifies how essential an open source project is by evaluating multiple dimensions of its usage, popularity, community engagement, and activity. It is displayed on the project overview page as a numeric indicator, but only for projects where relevant data is available.

In the future, **we aim to cover the Top 10,000 projects by Criticality Score**. This roll-out will take place gradually.

### How Is the Score Calculated?

The score is built using several “signals” (parameters) that show how active, popular, and depended-on the project is. Each parameter has a WEIGHT that tells the algorithm how important that signal is.

### 1. Collect Data for Each Parameter

For each open source project, we gather these numbers:

| Parameter | Weight | What it means (simple) | Why it's important |
|---|---|---|---|
| created_since | 1 | Months since the project began | Older projects are more widely used |
| updated_since | -1 | Months since last update | Unmaintained = less trusted |
| contributor_count | 2 | Number of contributors | More people = more importance |
| org_count | 1 | Companies on contributor list | Multi-company = broader dependency |
| commit_frequency | 1 | Weekly commit avg (past year) | More updates = more activity |
| recent_releases_count | 0.5 | Releases in the past year | Frequent updates = users care |
| closed_issues_count | 0.5 | Issues closed in last 90 days | More closed = high engagement |
| updated_issues_count | 0.5 | Issues updated in last 90 days | Ongoing activity in issue tracker |
| comment_frequency | 1 | Avg. comments per issue (90 days) | Users are active and discuss issues |
| dependents_count | 2 | Mentions in commit messages | More mentions = many projects rely on it |

Each signal has a maximum threshold too (e.g. 5000 contributors; 120 months), so extremely high numbers don’t skew everything else.

### 2. Apply Weights and Normalize Values

- Larger weights mean the parameter is more important in the final score.
- Negative values (like `updated_since`) decrease your score if too long without updates.
- Every parameter’s value is normalized: Values higher than its max threshold are capped (e.g. if a project is older than 120 months, it’s counted as 120 months).

**Example:**

If a project has 6000 contributors, we limit (cap) it to 5000 (the threshold for `contributor_count`).

### 3. Calculate the Final Score

Here’s how the formula works for each project:

For each parameter:
`Score for parameter = (actual value) / (max threshold) * (weight)`

- Add up all the individual parameter scores
- Normalize the sum so the final score is a number between 0 and 1

In code (and YAML configs) this is often called the **Rob Pike algorithm**.

### 4. Example Calculation (using real Kubernetes data)

Let’s see how the criticality score is derived using the latest example:

| Parameter | Value | Weight (αi) | Max threshold (Ti) |
|---|---|---|---|
| created_since | 87 | 1 | 120 |
| updated_since | 0 | -1 | 120 |
| contributor_count | 3999 | 2 | 5000 |
| org_count | 5 | 1 | 10 |
| commit_frequency | 97.2 | 1 | 1000 |
| recent_releases_count | 70* | 0.5 | 26 |
| updated_issues_count | 5395 | 0.5 | 5000 |
| closed_issues_count | 3062 | 0.5 | 5000 |
| comment_frequency | 5.5 | 1 | 15 |
| dependents_count | 454,393 | 2 | 500,000 |

(*Note: If a value exceeds the max threshold, it is capped at the maximum for calculations. So, 70 exceeds 26 for `recent_releases_count`, so will be set to 26.*)

Now, for each parameter, the score is:

`parameter_score = (min(actual_value, Ti) / Ti) * αi`

Let’s calculate:

- **created_since:** (87 / 120) * 1 = 0.725
- **updated_since:** (0 / 120) * -1 = 0
- **contributor_count:** (3999 / 5000) * 2 = 1.5996
- **org_count:** (5 / 10) * 1 = 0.5
- **commit_frequency:** (97.2 / 1000) * 1= 0.0972
- **recent_releases_count:** (26 / 26) * 0.5= 0.5 (Capped at threshold)
- **updated_issues_count:** (5000 / 5000) * 0.5 = 0.5 (Capped at threshold)
- **closed_issues_count:** (3062 / 5000) * 0.5 = 0.3062
- **comment_frequency:** (5.5 / 15) * 1 = 0.3667
- **dependents_count:** (454393 / 500000) * 2 = 1.8176

Now, sum these up:

`Total Raw Score = 0.725 + 0 + 1.5996 + 0.5 + 0.0972 + 0.5 + 0.5 + 0.3062 + 0.3667 + 1.8176 = 6.4123`

The tool then normalizes this raw score so it falls between 0 and 1 (details can vary, but this step ensures all projects are comparable regardless of the number of parameters).

For Kubernetes, the final visualized score is: `default_score: 0.99107` (very critical!).

### 5. Customizing the Score Calculation

You can change the importance (weights) of each parameter or their max thresholds by editing the config file (`original_pike.yml` by default).

### 6. Customizing Scoring Details

You can change how the score is calculated by editing the configuration file (e.g., `original_pike.yml`).

- For example, if your community thinks “recent updates” are much more important, you can increase the weight for `updated_since`.
- If you want to consider “number of releases” less, you can decrease its weight.
- You also can set new thresholds for each parameter, which changes how quickly each value “maxes out” for the score.

Run the tool with a custom configuration by supplying the `-scoring-config` flag, like this:

```bash
criticality_score -scoring-config=my_criteria.yml https://github.com/example/repo
```

This makes the system flexible for many types of open source ecosystems!

### 7. How to Use the Tool

#### Install the Tool
```bash
go install github.com/ossf/criticality_score/v2/cmd/criticality_score@latest
```

#### Set Github Auth Token (so you don’t hit API limits)
```bash
export GITHUB_AUTH_TOKEN=<your access token>
```

#### (Optionally) Authenticate with Google Cloud
Needed for some features:
```bash
gcloud auth login --update-adc
```

#### Run Criticality Score
Example command:
```bash
criticality_score -gcp-project-id=[your_projectID] https://github.com/kubernetes/kubernetes
```

#### Get Results!
The output will show detailed parameter values, as well as the final score:
```
default_score: 0.99107
```

### 8. How this Helps You and the Community

By using the criticality score, you can:
- Identify which dependencies and projects are most important to secure.
- Guide funding or support towards projects that the whole community relies on.
- Proactively spot unmaintained or risky projects.

### 9. Summary Table: Parameters and Reasoning

| Parameter | Weight | Max Threshold | What It Tells Us |
|---|---|---|---|
| Months since creation | 1 | 120 | Older projects likely have more users and dependencies |
| Months since last update | -1 | 120 | Recently maintained = project is still alive and trusted |
| Contributor count | 2 | 5000 | More people involved = more important |
| Org count | 1 | 10 | More organizations = more cross-company use |
| Commit frequency | 1 | 1000 | Frequent changes = active project |
| Recent releases count | 0.5 | 26 | Frequent releases = more usage, but not always required |
| Closed issues (90d) | 0.5 | 5000 | Shows contributors respond to and resolve problems |
| Updated issues (90d) | 0.5 | 5000 | Ongoing engagement |
| Comment frequency (90d) | 1 | 15 | Discussions and questions = more people depend on it |
| Dependents count | 2 | 500,000 | High = many other projects directly rely on this one |


#### Availability

The Criticality Score is **not available for every project** in LFX Insights. It is only shown for repositories where sufficient data exists to run the scoring model reliably.

#### Why Project Criticality Matters

Identifying a project as “critical” helps:

- Prioritize resource allocation for security reviews and maintenance
- Guide funding and community support to essential infrastructure
- Highlight risks associated with unmaintained or under-resourced dependencies

By surfacing this information, LFX Insights aims to help stakeholders make more informed decisions about which projects require additional attention or support.

#### Learn More

To explore the model, source code, and most up-to-date methodology, visit the [OpenSSF Criticality Score](https://github.com/ossf/criticality_score).

### Manual curation

While the index is data-driven, we apply a layer of manual curation to maintain quality and relevance:

- We exclude projects that are pure documentation or mirrors (e.g., kernel mirrors).
- We aim to avoid duplication, noise, or “ghost repositories”.

Our goal is not quantity, but clarity - showcasing the projects that companies and developers rely on.

## Evolving scope

The LF Open Source Index is not static. As the ecosystem evolves, we continuously review and consider:

- New LF projects
- Emerging non-LF projects
- Projects that have become deprecated or inactive

If you have any questions or feedback, please reach out to us at [insights@linuxfoundation.org](mailto:insights@linuxfoundation.org). We are open to improving the selection process together with the community.
