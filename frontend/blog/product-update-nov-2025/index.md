---
title: 'Product Update November 2025 | LFX Insights'
description: 'Project leaderboards, security-insights.yml generator, and more.'
authorName: 'Jonathan Reimer'
authorImage: '/blog/images/jonathan-headshot-2025.png'
authorCompany: 'The Linux Foundation'
datePublished: '2025-11-11'
---

# Product Update November 2025

We’re excited to share one of the biggest updates yet for **LFX Insights** — a new way to explore, compare, and understand activity across the world’s most critical open source projects.

## Leaderboards: Ranking Open Source Projects

Insights now features **9 leaderboards** that rank projects across multiple dimensions of activity and performance. These leaderboards make it easy to identify fast-moving communities, efficient maintainers, and growing ecosystems at a glance.

**Available leaderboards:**
1. **Most Active Contributors** — projects attracting the highest number of unique contributors in the past year  
2. **Most Active Organizations** — projects bringing together the largest number of distinct contributing organizations  
3. **Commit Activity** — projects with the highest volume of commits over the past 12 months  
4. **Codebase Size** — projects maintaining the largest codebases measured in total source lines of code  
5. **Fastest Responders** — projects with the shortest average time to first response on issues  
6. **Fastest Mergers** — projects with the shortest average time to merge pull requests
7. **Most Focused Teams** — projects with highest numbers of commits per contributor
8. **Highest Resolution Rate** — projects resolving the highest pull request to issue ratio
9. **Small Teams, Massive Output** — projects with less than 50 contributors with the highest number of commits

You can explore [all leaderboards](https://insights.linuxfoundation.org/leaderboards) directly in LFX Insights to see how your favorite projects perform.

## Generate a security-insights.yml

LFX Insights now supports generating a `security-insights.yml`, providing a standardized way for projects to document and share their security practices.

The YAML file aligns with the [OpenSSF Security Insights specification](https://github.com/ossf/security-insights) and helps projects:
- Maintain consistent security documentation across repositories  
- Self-assess against community best practices  
- Improve transparency and trust with users and contributors  

You can generate this file under a project’s Security & Best Practices tab in Insights.

### CNCF.io Embeds LFX Insights

The Cloud Native Computing Foundation (CNCF) has begun embedding live Insights data directly on **[CNCF.io](https://www.cncf.io)** project pages.  

This integration helps visitors see real-time community metrics and activity data alongside project information.

## Expanded Project Coverage

Insights now includes:
- **All 1,000+ Linux Foundation-hosted projects**  
- **Over 1,200 critical open source projects**

We’re continuing to scale project onboarding, intending to cover **10,000 critical open source projects** in the coming months.

If your project isn’t yet listed, you can request onboarding here:  
👉 [Submit your project](https://github.com/linuxfoundation/insights/discussions/categories/project-onboardings?discussions_q=is:open+category:%22Project+onboardings%22+sort:top)


## Filter by Repository Groups

Large-scale projects like Kubernetes use **repository groups** such as Special Interest Groups (SIGs) to organize their work.  

You can now **filter Insights data by these repository groups**, allowing a more granular view of contributions, activity, and trends within complex ecosystems.


## Share your feedback

If you have any thoughts or feedback on LFX Insights, please let us know in our [GitHub discussions](https://github.com/linuxfoundation/insights/discussions).
