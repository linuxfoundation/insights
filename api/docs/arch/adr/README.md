# Architecture Decisions

This directory contains Architecture Decision Records (ADRs) for the Insights project.

ADRs capture significant architectural choices — technology selections, patterns, data
modeling, infra, API design — along with the context and alternatives that were
considered at the time. They are intended to be read by future contributors asking
"why does the code work this way?"

See [template.md](./template.md) for the required format, or invoke `/adr` in Claude
Code to record a new decision interactively.

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| [ADR-0001](./0001-fastify-over-nestjs.md) | Fastify over NestJS for the public API service | | |
| [ADR-0002](./0002-api-at-repo-root.md) | Public API service lives at `/api` (repo root), not inside `workers/` | | |
| [ADR-0003](./0003-tolerant-reader-versioning.md) | v1 contract: tolerant-reader / additive-only changes within a version | | |
| [ADR-0004](./0004-server-to-server-cors-deny.md) | v1 is server-to-server only; CORS denies all browser origins | | |
| [ADR-0005](./0005-tiers-control-rate-limits-only.md) | Tiers control rate limits only in v1; no per-endpoint feature gating | | |
| [ADR-0006](./0006-pat-token-exchange-for-api-credentials.md) | API credentials are PATs exchanged for short-lived JWTs via Auth0 Custom Token Exchange | accepted | 2026-08-05 |
| [ADR-0007](./0007-collections-only-permission-check.md) | Only Collections endpoints require a per-request permission check; groups 1–5 are public-data-only | | |
| [ADR-0008](./0008-typebox-code-first-openapi.md) | TypeBox for code-first OpenAPI schema generation | | |
| [ADR-0009](./0009-api-key-required-for-all-requests.md) | Every request requires a valid API key; no anonymous access | | |
| [ADR-0010](./0010-billing-bundled-with-lfx-membership.md) | API access is bundled with LFX membership; no standalone billing in v1 | | |
| [ADR-0011](./0011-pagination-cursor-based.md) | Pagination is cursor-based with opaque base64url cursors | | |
| [ADR-0012](./0012-url-port-strategy-hybrid.md) | URL porting strategy: port-as-is by default, rename only when genuinely misleading | | |
| [ADR-0013](./0013-origin-cache-only-private-cache-control.md) | Responses are cached at the origin (Redis) only; `Cache-Control: private, max-age=0` | | |
| [ADR-0014](./0014-camelcase-json-iso8601-dates.md) | All JSON keys are camelCase; dates are ISO-8601 UTC strings | | |
| [ADR-0015](./0015-api-keys-issued-by-lfx-self-serve.md) | API keys are issued by the LFX Self-Serve App | | |
| [ADR-0016](./0016-vitepress-scalar-api-docs.md) | API docs use VitePress + Scalar, served from `api/docs/` | | |
| [ADR-0017](./0017-collections-queries-not-shared.md) | Collections Postgres queries are written fresh in `/api`, not shared with the frontend | | |
| [ADR-0018](./0018-structured-json-logging.md) | Structured JSON logging via pino; log levels follow LFX-0002 | | |
| [ADR-0019](./0019-opentelemetry-instrumentation.md) | OpenTelemetry instrumentation; OTel trace ID is the request ID | | |
