
# Frequently Asked Questions

## Project Selection

**What projects are included in LFX Insights?**  
For now, Insights includes Linux Foundation-hosted projects and a selection of critical non-LF projects. Our focus is on software that is actively maintained and widely used in the open source ecosystem.

**How do you decide which non-Linux Foundation projects are added?**  
We use the [OpenSSF Criticality Score](https://openssf.org/projects/criticality-score/) to identify impactful projects. We apply manual filters to remove non-code or mirrored repositories.

**Why isn’t my project listed?**  
If your project isn’t hosted by the LF and doesn’t meet our criticality criteria, it may not be included. We’re working on expanding coverage continuously.

**My project is listed, but the data looks incorrect — how can I fix it?**  
You can suggest changes or flag issues via the Insights dashboard ("report issue") or by emailing us at [insights@linuxfoundation.org](mailto:insights@linuxfoundation.org).

## Understanding Metrics

**What do the different scores mean?**  
We documentented detailed explanations for each metric. You can find them grouped by the four different dimensions: [Contributors](../../metrics/contributors/index.md), [Development](../../metrics/development/index.md), [Health Score](../../metrics/health-score/index.md), [Popularity](../../metrics/popularity/index.md), and [Security & Best Practices](../../metrics/security/index.md).

**How is the overall project healthscore calculated?**  
The total score is a weighted sum of the four dimensions. Each dimension is scored on a fixed scale and based on transparent benchmarks. You can read more details in the [Health Score](../../metrics/health-score/index.md) section.

**What does “criticality” mean in this context?**  
“Criticality” reflects how essential a project is to the broader ecosystem. It includes factors like usage, dependency footprint, contributor activity, and update frequency. We determine criticality based on the [OpenSSF Criticality Score](https://openssf.org/projects/criticality-score/).

**How often are the metrics updated?**  
Most project data is refreshed daily. Some metrics tied to contributor identity or external data sources may update less frequently.

## Contributors & Organizations

**How do you track contributor activity across different platforms and email addresses?**  
We use AI-assisted identity resolution to unify contributor profiles across multiple handles and domains. Manual review and community feedback also help improve accuracy.

**Why are my contributions not showing up?**  
This usually happens if we haven’t correctly linked your identity or if contributions occurred under an unrecognized alias. Please refer to [How You Can Help to Improve Data Quality](../../introduction/data-quality/index.md#how-you-can-help-to-improve-data-quality) to learn how to report incorrect data.


**Why is my organization not properly affiliated to our contributions?**  
We do organizational affiliation based on publicly available profile data (e.g. from GitHub), email domains, and other public and private signals. Nevertheless, it happens that affiliations are not correct. Please refer to [ How You Can Help to Improve Data Quality](../../introduction/data-quality/index.md#how-you-can-help-to-improve-data-quality) to learn how to report incorrect affiliations.

## Data Quality and Corrections

**Where does LFX Insights get its data?**  
Our data comes from our internal [Community Data Platform](https://github.com/CrowdDotDev/crowd.dev), which covers 20+ different sources. Learn more about [Data Sources](../../introduction/data-sources/index.md).

**Why is open source data so difficult to get right?**  
There’s no single source of truth, and most data comes from weak control data sources. For example: Contributors use multiple emails, organizations have complex naming conventions, and projects span diverse platforms. 

**Q: How do you ensure accuracy in your contributor and project data?**  
We use a multi-step process involving AI enrichment, human curation, and direct user feedback. Our goal is 90%+ correctness in production data. Learn more about [Data Quality](../../introduction/data-quality/index.md).

**Q: Can I suggest a correction or improvement?**  
Yes — you can submit feedback via the Insights interface or by contacting us at [insights@linuxfoundation.org](mailto:insights@linuxfoundation.org). We welcome community-submitted improvements!

## Using Insights

**How can I use the Insights data to make better decisions?**  
Insights can help identify healthy projects, track contributor impact, and assess technical trustworthiness. It’s useful for OSPOs, foundations, security teams, and developers alike.

**Can I export data or integrate it into our internal dashboards?**  
Direct data export isn’t supported today.

**Can I embed my project’s score or badge in a README?**  
Yes — we offer embeddable project badges. These can be added to your GitHub README or documentation to showcase your project’s status.

## Roadmap and Feedback

**Will more projects or metrics be added?**  
Yes. We’re constantly expanding coverage, refining the scoring model, and integrating more data dimensions based on community needs.

**How can I give feedback or request a feature?**  
You can send an email to [insights@linuxfoundation.org](mailto:insights@linuxfoundation.org).
