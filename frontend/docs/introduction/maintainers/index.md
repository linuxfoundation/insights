# Maintainers

## Overview

LFX Insights automatically identifies and tracks [maintainer](../../more/glossary/index.md) information across open source repositories to provide visibility into project governance and leadership structures. This data helps organizations understand project stewardship and contributor roles.

## Data Collection Process

### Source Files

Maintainer data is extracted from specific files commonly found in GitHub repositories, including:

- `MAINTAINERS`
- `MAINTAINERS.md`
- `MAINTAINER.md`
- `CODEOWNERS.md`
- `CONTRIBUTORS`
- `CONTRIBUTORS.md`
- `docs/MAINTAINERS.md`
- `OWNERS`
- `CODEOWNERS`
- `.github/MAINTAINERS.md`
- `.github/CONTRIBUTORS.md`

### Collection Method

Our automated system:

1. **Scans repositories** for maintainer files using predefined filename patterns.
2. **Analyzes file contents** using AI-powered content analysis to extract structured maintainer information.
3. **Normalizes roles** to standardize titles and responsibilities across projects.
4. **Stores data** in a structured format linked to contributor identities.

### Data Points Collected

From maintainer files, we extract:

- **GitHub usernames** of maintainers.
- **Display names** and contact information including email addresses when available.
- **Roles and titles** (e.g., "Lead Maintainer", "Core Developer", "Security Lead").
- **Organizational affiliations** when available.

## Data Refresh Frequency

Maintainer data is collected and updated daily to ensure accuracy and reflect changes throughout time. This automated process runs every 24 hours to capture any updates to maintainer files across all monitored repositories.

## Current Limitations

- **File-based only**: Maintainer data is currently sourced exclusively from repository files, not from external sources or manual input.
- **No manual updates**: Users cannot directly add or modify maintainer information through the LFX Insights or the LFX Platform.
- **GitHub repositories**: Collection is limited to GitHub-hosted repositories.
- **File format dependency**: Accuracy depends on the structure and format of maintainer files in each repository.

## Future Enhancements

We are actively working on expanding maintainer data collection capabilities, including:

- Users being able to directly update and correct maintainer information through the LFX platform.
- Git history analysis to track maintainer role changes over time.
- Support for additional file formats and locations.
- Enhanced role normalization and classification.

## Data Privacy and Accuracy

All maintainer information is sourced from publicly available repository files. If you notice inaccuracies in maintainer data for your projects, please ensure your repository's maintainer files are up-to-date and properly formatted.
