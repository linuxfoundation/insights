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
