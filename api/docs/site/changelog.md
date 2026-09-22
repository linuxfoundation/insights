---
title: Changelog
---

# Changelog

There is no versioned release of the Insights API yet. This page documents the entry
format that release notes will follow once one ships; no entries below are real.

See [Endpoint lifecycle](/lifecycle) for how an endpoint moves from `/v1-alpha` to a
released `/v1` state in the first place.

## Entry format

Each release gets a dated heading. Under it, changes are grouped into up to four
categories, and each change is a single line:

- **Added**: new endpoints, fields, or error codes
- **Changed**: behavior changes to existing endpoints or fields
- **Deprecated**: endpoints or fields still available but scheduled for removal
- **Removed**: endpoints or fields no longer available

```md
## 2026-01-15

### Added

- `GET /v1/organizations/{id}/health-score`

### Changed

- `activityTypes` filter on `/v1/activities` now accepts multiple values

### Deprecated

- `sort=date` on `/v1/activities`, use `sort=activityDate` instead
```

Only categories with at least one change are included in a given release; a release with
nothing removed simply omits the `Removed` heading.
