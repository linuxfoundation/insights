# ADR-0021: Deprecation and Sunset headers use the RFC 9745 and RFC 8594 wire formats

**Date**: 2026-09-17
**Status**: accepted

## Context

[ADR-0003](./0003-tolerant-reader-versioning.md) records the deprecation process, and its step 2 shows the header wire formats as `Deprecation: true` with an ISO-8601 `Sunset` date. That `true` form comes from the IETF draft that predates standardization. RFC 9745 (published March 2025, after ADR-0003 was written) defines the `Deprecation` header as a Structured Fields Date, `@<unix-timestamp>`, and a bare boolean is not a valid value under it. RFC 8594 defines `Sunset` as an HTTP-date (IMF-fixdate), the same format as `Expires`.

## Decision

Lifecycle headers on deprecated API versions are emitted as `Deprecation: @<unix-timestamp>` per RFC 9745 and `Sunset: <HTTP-date>` (IMF-fixdate) per RFC 8594. The registry keeps dates as `YYYY-MM-DD` strings and the server derives both wire formats at build time (see `src/versions/lifecycle.ts`). This supersedes the header formats in ADR-0003 step 2; the rest of that ADR's deprecation process stands.

## Alternatives considered

- **Keep `Deprecation: true` as recorded in ADR-0003.** Rejected: it is obsolete draft syntax, invalid under RFC 9745, and a boolean loses the deprecation date. Standards-aware tooling parses the `@<unix-timestamp>` form.

## Consequences

- Consumers and tests must expect `@<unix-timestamp>` and IMF-fixdate values, never `true` or ISO-8601 dates on the wire.
- ADR-0003 step 2 is marked superseded in part and points here.
