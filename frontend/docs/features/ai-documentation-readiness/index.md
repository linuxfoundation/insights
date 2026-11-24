# AI Documentation Readiness

## Overview

AI agents, such as coding assistants, need to find and read your project's documentation before they can use it. This assessment helps you spot barriers that make that harder, such as missing links, inaccessible pages, or content that gets lost when a page is read as text.

Insights shows a score out of 100, a breakdown of the checks, and suggestions for improvement. Use it to decide where to focus work on your documentation website.

::: info Experimental
This feature is currently available for Linux Foundation projects. It assesses how accessible documentation is to AI agents, not whether the instructions are correct or whether an assistant will produce a correct answer.
:::

## What powers the assessment

Insights runs [AFDocs](https://afdocs.dev), an open-source tool that tests documentation websites against the [Agent-Friendly Documentation Spec](https://agentdocsspec.com). The spec defines what makes documentation easier for AI agents to discover, read, and use.

AFDocs provides the individual check results. Insights calculates the displayed score using the category weights described below. You can explore the [AFDocs checks reference](https://afdocs.dev/checks/) to understand what each validation looks for and how to address it.

## Find your project's results

1. Open your project's page in Insights.
2. Find **AI docs readiness** in the project overview.
3. Select **View breakdown** to open the **AI documentation readiness** card in **Security & Best Practices**. You can also open that tab directly.

The assessment covers the project's documentation website. Selecting a repository or repository group does not change the results. Documentation that lives only in a code repository is not scored.

## Read the results

Start with **Evaluated documentation**. Open the link to check that Insights assessed the right website. The labels explain how Insights found it and how confident it is that the URL belongs to your project's docs. This confidence is about the website selection, not the quality of its documentation.

The card also shows how many pages were tested. If only the landing page could be tested, Insights warns that the score may not reflect the whole site.

### Score and comparison

A higher score means more of the applicable Agent-Friendly Docs checks passed. These are automated checks of how agents can find, read, and access documentation.

Each category contributes a fixed share of the 100-point score. Within a category, applicable checks count equally, and only passed checks earn credit. If a category has no applicable checks, either because all checks were skipped or because it has no check results, it receives its full share of the score and is labeled **Not assessed · full points**. Skipped checks do not reduce the score, but they do not confirm that the skipped behavior works.

When available, the **LF project median** gives you a comparison with the middle score for evaluated Linux Foundation projects. It is a reference point, not a pass mark.

### Score breakdown

Expand a category to see individual checks, their results, and **How to fix** suggestions where a check needs work.

| Category | Points available | What it looks for |
| --- | --- | --- |
| Content discoverability | 30 | An `llms.txt` file: a short index that helps AI agents find important documentation pages. |
| Markdown availability | 15 | Pages available as Markdown, a plain-text format with headings, links, and code blocks. |
| Page size | 15 | Pages short enough for an agent to read, with the main content near the top. |
| Content structure | 10 | Headings, tabs, and code examples that remain understandable when read as text. |
| URL stability | 10 | Working redirects and clear responses when pages do not exist. |
| Observability | 10 | A documentation index and Markdown copies that cover the site and stay up to date. |
| Authentication | 10 | Documentation readable without signing in, or a public index for restricted docs. |

Each check has one of these statuses:

- **Passed**: the check's requirements were met.
- **Needs attention**: the check found something to improve.
- **Failed**: the check's requirements were not met.
- **Couldn't run**: the check encountered an error, so it could not confirm the result.
- **Skipped**: the check did not apply or needed another check to pass first. For example, checks of links inside `llms.txt` are skipped if that file is missing.

## Use the results to improve your docs

The overview highlights the **Biggest gap**, the category with the most points left to earn. Start there, then read its checks to understand the cause.

For example, if **Content discoverability** is the biggest gap and **An llms.txt file is published** has failed:

1. Confirm that the evaluated URL is your main documentation website.
2. Ask your documentation team to publish an `llms.txt` index of the key pages, following the check's **How to fix** suggestion.
3. Review the next evaluation to see whether the check passes and whether related checks can now run.

You can share the failed checks and their suggestions with whoever maintains your documentation site. Changes need to be published on that site; Insights does not edit your documentation.

## Correct the documentation URL

If Insights assessed the wrong site, select **Wrong URL? Request a correction**. If it could not find a site, use the suggestion link shown in its place.

1. Sign in to Insights if prompted, then select the correction link again.
2. Choose a suggested website or select **A different URL** and enter the full documentation link, starting with `https://`.
3. If appropriate, choose **The project has no documentation site** instead.
4. Optionally explain what is wrong with the current URL or where the correct docs are linked from.
5. Select **Submit request**. The confirmation includes **View issue** so you can follow the request.

::: warning Public request
Your request is posted as a public GitHub issue in the Insights repository. Do not include passwords, private links, or other sensitive information.
:::

The LF team reviews the request. Submitting it does not immediately change the score. Once approved, the next evaluation uses the new URL, and future evaluations use it instead of automatically choosing a site. The card labels it **Confirmed by LF team**. You can request another correction if the docs move again.

## Updates and missing results

Projects are reevaluated monthly. New projects are normally evaluated within a day, and failed evaluations are retried daily. Check **Last evaluated** and **Next evaluation** for your project's timing.

**Score history** shows the latest successful evaluation for each month. A failed month is marked **Failed**, rather than shown as a zero. A marker identifies a change in the documentation URL; keep that in mind when comparing scores over time.

If the latest evaluation could not complete, Insights shows the previous successful results when available, with a notice explaining their date.

A missing score is not a score of zero:

| Message | What to do |
| --- | --- |
| No documentation site found | Suggest the documentation URL if your project has a website for its docs. |
| Docs live in the code repository | Suggest a documentation website if one exists. Repository-only docs are not assessed. |
| No documentation site | The LF team confirmed there is no site to assess. Request a correction if your project has since published one. |
| Not evaluated yet | Check back after the project's first evaluation. |
| Evaluation failed | Insights will retry daily. Check the documentation URL and request a correction if it is wrong. |
| AI documentation readiness isn't available right now | Results could not be displayed. Try again later. |
