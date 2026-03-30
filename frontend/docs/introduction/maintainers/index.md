# Maintainers

## Overview

LFX Insights automatically identifies and tracks [maintainer](../../more/glossary/index.md) information across open source repositories to provide visibility into project governance and leadership structures. This data helps organizations understand project stewardship and contributor roles.

## Data Collection Process

### Source Files

Maintainer data is extracted from governance-related files found anywhere in a repository (not just the root), including files matching these patterns:

| File pattern | Examples |
|---|---|
| Maintainer lists | `MAINTAINERS`, `MAINTAINERS.md`, `MAINTAINER.md` |
| Owner files | `OWNERS`, `CODEOWNERS`, `CODEOWNERS.md` |
| Contributor lists | `CONTRIBUTORS`, `CONTRIBUTORS.md` |
| Governance docs | `GOVERNANCE.md`, `GOVERNANCE.yaml`, `GOVERNANCE.toml` |
| Emeritus lists | `EMERITUS`, `EMERITUS.md` |
| Security insights | `SECURITY-INSIGHTS.md` |
| README files | `README.md`, `README` (only when they contain maintainer-related content) |

Files are discovered recursively across the full repository tree. Files inside third-party directories (`vendor/`, `node_modules/`, `third_party/`, `external/`) are excluded.

### Collection Method

Our automated system scans the full repository tree recursively — not just the root — to find governance-related files. If a file was identified on a previous run, it is reused as the starting point.

`README.md` files are only analyzed when they explicitly mention maintainers. For README and governance files, only sections relevant to maintainer information (e.g., headings like "Maintainers", "Owners", or "Reviewers") are extracted before analysis, improving accuracy on large files.

Once a file is identified, an AI model extracts structured maintainer information from it:

- **Full coverage** — every person listed in the file is extracted, regardless of section or role.
- **YAML and TOML support** — for structured files, top-level keys matching governance terms are extracted.
- **Role normalization** — each person is assigned a standardized role. Reviewers and designated reviewers are normalized to "maintainer".

### Data Points Collected

From maintainer files, we extract:

- **GitHub usernames** — identified from `@username` mentions, markdown profile links, and `users.noreply.github.com` email addresses.
- **Display names** and contact information, including email addresses when available.
- **Roles and titles** — as listed in the file (e.g., "Lead Maintainer", "Core Developer", "Security Lead").
- **Normalized roles** — a standardized role assigned based on context.
- **Organizational affiliations** when available.

### Identity Resolution

Extracted contributors are matched against known identities using their GitHub username as the primary signal, with email address as a fallback when a username is unavailable.

## Data Refresh Frequency

Maintainer data is collected and updated daily to ensure accuracy and reflect changes over time. This automated process runs every 24 hours to capture any updates to maintainer files across all monitored repositories.

## Current Limitations

- **File-based only**: Maintainer data is currently sourced exclusively from repository files, not from external sources or manual input.
- **No manual updates**: Users cannot directly add or modify maintainer information through LFX Insights or the LFX Platform.
- **GitHub repositories**: Collection is limited to GitHub-hosted repositories.

## Future Enhancements

We are actively working on expanding maintainer data collection capabilities, including:

- Users being able to directly update and correct maintainer information through the LFX platform.
- Git history analysis to track maintainer role changes over time.

## Data Privacy and Accuracy

All maintainer information is sourced from publicly available repository files. If you notice inaccuracies in maintainer data for your projects, ensure your repository's maintainer files are up-to-date and properly formatted.
