# Security & Best Practices

The control assessments that we run for "Security & Best Practices" are powered by the [Open Source Project Security Baseline](https://baseline.openssf.org) by OpenSSF.

Please note that Insights only runs control assessments that work without privileged access to a project's codebase.

Where supported (currently, only GitHub and Gitlab), it also ignores repositories that are archived, meaning they won't affect the final results of the assessments.

Additionally, some repositories may be marked as excluded, even if they are not archived. One example of this are `.github` repositories, which are automatically marked as excluded, but not archived. Repositories marked as excluded are also not taken into account in the security assesments.

To improve security & best practices, we recommend maintainers to check out the Baseline project and validate all control assessments.
