
# Popularity Metrics Explained

This page explains the key popularity metrics tracked by LFX Insights. These indicators help you understand <b>how widely adopted and talked-about an open source project is</b> across the web and developer ecosystem.

## Stars

**What it is:** The number of stars a project has received on GitHub.

**Why it matters:** Stars are a quick way for users to express interest. A high star count suggests broad awareness and community appreciation.

## Forks

**What it is:** The number of times a project has been forked on GitHub.

**Why it matters:** Forks often indicate developer interest in modifying, contributing to, or building on top of a project.

## Social Mentions 

<i>Coming soon.</i>

**What it is:** Mentions of the project across platforms like Twitter/X, Reddit, Hacker News, and other social media.

**Why it matters:** Social mentions show real-time buzz and community conversations, signaling current relevance and visibility.

## GitHub Mentions 

<i>Coming soon.</i>

**What it is:** References to the project repository in issues, pull requests, and READMEs on GitHub.

**Why it matters:** Frequent GitHub mentions show that developers are integrating or referencing the project in their workflows and codebases.

## Press Mentions

<i>Coming soon.</i>

**What it is:** The number of times the project is mentioned in online news outlets, blogs, and tech media. 

**Why it matters:** Press mentions reflect broader industry attention and can drive credibility and adoption beyond the developer community.

## Search Queries Volume

**What it is:** The volume of search engine queries for the project.

**Why it matters:** Search trends indicate public interest and awareness. A rising number of queries often correlates with growing adoption.

#### How the Data Is Collected
To estimate search volume, we use [Keywords Everywhere](https://keywordseverywhere.com/), a third-party API that provides monthly search trends based on aggregated data from platforms like Google Trends and Keyword Planner.

For each project:
- The project's slug (e.g., linux, datahub) is used as the query term. This assumes the slug most accurately reflects the name users would search for.
- Query the Keywords Everywhere /v1/get_keyword_data endpoint to return the monthly search volume estimates for the last 12 months.
- The historical aggregation is designed to be run monthly. Each run captures a rolling 12-month window.

*Note: Historical data before June 2024 is unavailable, as we initiated data collection in June 2025.*

## Package Downloads

**What it is:** The total number of downloads for a project’s packages across supported package registries (e.g., PyPI, npm, Maven, Conda, Docker Hub).

**Why it matters:** High download counts are a strong signal of adoption and usage. They indicate how widely the project is being installed, integrated, and potentially relied upon by users and systems in the ecosystem.

#### How the Data Is Collected
Package download data is retrieved using the [ecosyste.ms](https://ecosyste.ms/) API.

For each project repository:
- Query the ecosyste.ms `/packages/lookup` endpoint to retrieve all packages linked to that repository.
- For each package, it pulls the `downloads_count` (downloads from the primary registry) and `docker_downloads_count` (if applicable).
- The historical aggregation is designed to be run daily. Each run captures a rolling 24-hours window.

These values are aggregated and stored, grouped by registry and package name.

*Note: Historical data prior to June 1, 2025 is unavailable, as data collection began on that date.*

## Package Dependency

**What it is:** A set of metrics reflecting how many other repositories, packages, or Docker images depend on the project’s packages.

**Why it matters:** Dependency data is a proxy for influence and integration within the software ecosystem. If many other projects or containers depend on a package, it suggests trust, stability, and criticality.

#### How the Data Is Collected
Package download data is retrieved using the [ecosyste.ms](https://ecosyste.ms/) API.

For each project repository:
- Query the ecosyste.ms API to retrieve associated packages across various registries.
- For each package, it collects:
    - `dependent_repos_count`: Number of repositories that depend on the package.
    - `dependent_packages_count`: Number of packages that list this package as a dependency.
    - `docker_dependents_count`: Number of Docker images that rely on the package.
- The historical aggregation is designed to be run daily. Each run captures a rolling 24-hours window.

These values are aggregated and stored, grouped by registry and package name.

*Historical data prior to June 1, 2025 is unavailable, as data collection began on that date.*

## Mailing List Messages

<i>This metric is only available for selected projects of the Linux Foundation.</i>

**What it is:** The number of messages exchanged on the project’s public mailing lists. 

**Why it matters:** Mailing list activity reflects the depth and frequency of technical discussions, support requests, and community coordination.
