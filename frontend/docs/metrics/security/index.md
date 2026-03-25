# Security & Best Practices

## Controls Assessment

The control assessments that we run for "Security & Best Practices" are powered by the [Open Source Project Security Baseline](https://baseline.openssf.org) by OpenSSF.

Please note that Insights only runs control assessments that work without privileged access to a project's codebase.

Where supported (currently, only GitHub and Gitlab), it also ignores repositories that are archived, meaning they won't affect the final results of the assessments.

Additionally, some repositories may be marked as excluded, even if they are not archived. One example of this are `.github` repositories, which are automatically marked as excluded, but not archived. Repositories marked as excluded are also not taken into account in the security assesments.

To improve security & best practices, we recommend maintainers to check out the Baseline project and validate all control assessments.

## Vulnerabilities

The Security Vulnerabilities section surfaces known vulnerabilities found in your project's dependencies, helping teams track and remediate security risks across their repositories.

::: info
This section is only available to logged-in users.
:::

### How It Works

Insights scans repository dependencies using [OSV-Scanner](https://google.github.io/osv-scanner/), an open-source CLI tool maintained by Google. OSV-Scanner detects dependency manifests and lockfiles, then cross-references them against the [OSV.dev](https://osv.dev) vulnerability database — a platform that aggregates advisories from multiple authoritative sources including the CVE program.

Vulnerability data covers the last 12 months and reflects findings across all repositories in the project.

::: info
Vulnerability data is sourced from the CVE program only. CWE (Common Weakness Enumeration) entries are not included.
:::

### Supported Ecosystems

OSV-Scanner automatically detects a wide range of package managers and lockfile formats, including npm, Go modules, PyPI, Maven, Cargo, and more. For the full list of supported languages and lockfiles, see the [OSV-Scanner documentation](https://google.github.io/osv-scanner/supported-languages-and-lockfiles/).

### Metrics

The top of the Vulnerabilities section displays four key indicators:

| Metric | Description |
|---|---|
| **Open Vulnerabilities** | Total count of unresolved vulnerabilities across all scanned repositories |
| **Median CVSS** | Median severity score across all open vulnerabilities, using the CVSS (Common Vulnerability Scoring System) scale |
| **Fix Status** | Ratio of vulnerabilities that have a fix available in a newer package version (e.g., "6 of 8 fixable") |
| **Time Since Last Vulnerability** | How long ago the most recent vulnerability was detected |

### Charts

**Vulnerabilities by Severity**
A bar chart showing the distribution of vulnerabilities across severity levels: Critical, High, Medium, and Low. Severity is determined by the CVSS score associated with each CVE.

**Vulnerabilities by Ecosystem**
A breakdown of vulnerabilities grouped by package manager (e.g., npm, Go, PyPI). This helps identify which dependency ecosystems contribute most to your project's risk surface.

### Remediating Vulnerabilities

When a fix is available, upgrading the affected dependency to the patched version is the most direct remediation path. The Fix Status metric shows how many of your open vulnerabilities have a known fix, giving teams a clear starting point for triage.

For vulnerabilities without an available fix, consider:
- Monitoring the upstream package for a patch release
- Evaluating whether the vulnerable code path is reachable in your project
- Replacing the dependency with a maintained alternative
