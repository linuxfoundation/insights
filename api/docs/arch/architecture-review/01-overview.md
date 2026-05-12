# LFX Insights Public API — Architecture Review

**Date:** 2026-05-04  
**Author:** LFX Insights Engineering  
**Status:** Pending architecture team approval

**ADRs:** Architecture Decision Records are committed to the codebase at [`api/docs/arch/adr/`](../adr/) alongside the code they describe. Future engineers can find the reasoning for any decision without hunting through wikis or Notion. ADRs are append-only — past decisions are never edited, only superseded by new ones.

---

## Problem

All analytics endpoints in LFX Insights today live inside the Nuxt frontend (`frontend/server/api/`, ~106 files). They were built as internal routes for the web UI:

- Authenticated by Auth0 OIDC session cookies (browser-only) or a single shared Bearer secret.
- Rate limited only by IP — no per-customer identity, no tiers, no quota enforcement.
- Coupled to the frontend release cycle — changing a response shape requires coordinating UI changes in the same PR.
- No versioning contract, no public documentation, no SLA, no observability at the customer level.

LFX customers need programmatic access to the same analytics data to build pipelines, dashboards, and reports. We cannot expose the existing Nuxt routes as-is.

---

## What We Are Building

A standalone HTTP API service (`/api`, sibling of `frontend/`) that ports existing Nuxt analytics endpoints under a formal versioned contract with proper authentication, rate limiting, observability, and documentation.

### Key characteristics

| Property | Decision |
|---|---|
| Base URL | `https://api.insights.linuxfoundation.org/v1/...` |
| Location | `/api` at monorepo root, added to `pnpm-workspace.yaml` |
| Framework | Fastify + TypeScript + TypeBox |
| Auth | Refresh tokens issued by LFX Self-Serve (`app.lfx.dev/settings`); customer code mints short-lived access tokens via Insights `/v1/auth/token` (proxied to Self-Serve); Insights JWKS-verifies access tokens on every request |
| Rate limiting | Redis sliding window, per-org pool, tier-driven |
| Versioning | URL prefix (`/v1`, `/v2`); additive-only within a version |
| Contract | Tolerant-reader; no breaking changes within a major version |
| Docs | VitePress + Scalar at `api.insights.linuxfoundation.org/docs` (served by Fastify from `api/docs/site/`) |
| Observability | OpenTelemetry → Datadog (hybrid custom metrics + APM) |
| Callers | Server-to-server only in v1; CORS denies all browser origins |
| Billing | Bundled with existing LFX membership tiers; no standalone billing |
| SDKs | None in v1; OpenAPI spec + curl examples |

---

## Architecture

```
┌─────────────────────┐  1. create token  ┌──────────────────────────────────┐
│  User (browser)     │ ────────────────▶ │  LFX Self-Serve App              │
│                     │                   │  app.lfx.dev/settings            │
│                     │ ◀──────────────── │  Issues + revokes refresh tokens │
│                     │  2. refresh token  │  Publishes JWKS endpoint         │
└─────────────────────┘                   └──────────────────┬───────────────┘
          │                                                   ▲
          │ 3. paste refresh token                            │ 4. forward /token
          │    into server env                                │    request
          ▼                                                   │
┌─────────────────────┐  POST /v1/auth/token  ┌──────────────┴──────────────────┐
│  Customer server    │ ────────────────────▶ │  api.insights.linuxfoundation   │
│                     │ ◀──────────────────── │  .org  (Fastify, TypeScript)    │
│                     │  5. access token       │                                 │
│                     │     (~15 min)          │  /v1/auth/token  (proxy)        │
│                     │                        │  /v1/development/...            │
│                     │  6. Bearer <access_token>  /v1/contributors/...          │
│                     │ ────────────────────▶  │  /v1/popularity/...             │
└─────────────────────┘                        │  /v1/security/...               │
                                               │  /v1/collections/...            │
                               7. JWKS verify  └───────────┬─────────────────────┘
                     ┌─────────────────────────────────────┘
                     ▼
          (LFX Self-Serve JWKS endpoint — cached)
                                               └───────────┬─────────────────────┐
                                                           │                     │
                                                           ▼                     ▼
                                              ┌────────────────────────────────────────┐
                                              │  Redis                                 │
                                              │  Rate-limit counters                   │
                                              │  Response cache (cache hit → return)   │
                                              └──────────────┬─────────────────────────┘
                                                            │ cache miss
                                                ┌───────────┴───────────┐
                                                ▼                       ▼
                                     ┌─────────────────┐     ┌────────────────────┐
                                     │  Tinybird       │     │  Postgres          │
                                     │  (analytics)    │     │  (read host)       │
                                     │  dedicated read │     │  Collections auth  │
                                     │  replica *      │     └────────────────────┘
                                     └─────────────────┘

  * dedicated Tinybird read replica is the goal; pending
    confirmation from the Tinybird team on whether per-app
    replica isolation is supported.

       ┌────────────────────────────────────────────────────────────────────────┐
       │  App OTel SDK ──OTLP──▶ otel-collector sidecar ──▶ Datadog              │
       │                                                                        │
       │  Custom metrics  — low-cardinality tags only (endpoint, version,       │
       │                    tier, status_class). Billed per unique tag combo.   │
       │                    Used for: SRE dashboards, alerts, SLO tracking.     │
       │                                                                        │
       │  APM trace metrics — high-cardinality dims live on spans as attributes │
       │                    (customer_id, api_key_id). Not billed as metrics.   │
       │                    Used for: per-customer drilldowns, debugging.       │
       │                                                                        │
       │  Structured logs via pino, correlated to traces via trace_id / span_id  │
       │  (OTel hex format; Datadog ingests natively). Local dev: stdout.        │
       └────────────────────────────────────────────────────────────────────────┘
```

### Key management

Refresh tokens (what customers call their "API key") are created and managed entirely in the LFX Self-Serve App at `app.lfx.dev/settings`. The LFX Insights frontend deep-links to that page from a `/settings/api-keys` placeholder ([E15](../PUBLIC_API_PLAN.md#epic-e15--key-management-entry-point-lfx-insights-frontend)); it does not implement create / list / revoke. Membership gating (only Key Contacts in member organizations can create keys) is enforced by LFX Self-Serve, not by Insights. What the customer pastes into their environment is a refresh token; their code mints short-lived access tokens from it via Insights' proxied `/v1/auth/token` endpoint (per ADR-0006 and ADR-0015).

Whether the existing `app.lfx.dev/settings` personal access token is reused as the refresh token or a new Insights-scoped refresh token is minted is an open product question; see ADR-0015.

### Shared library strategy

Rather than duplicating Tinybird query logic, three workspace libraries are extracted:

- `libs/tinybird-client` — Tinybird HTTP client, AdaptiveSemaphore, bucket-per-project routing. Both `frontend/` and `api/` depend on it.
- `libs/insights-types` — shared enum definitions only (`ActivityPlatforms`, `ActivityTypes`, `Granularity`). Request/response shapes are defined separately per app.
- `libs/rate-limiter` — Redis sliding-window rate limiter, forked from `frontend/server/utils/rate-limiter.ts`.

---

## Endpoint Rollout

Endpoints are ported in seven groups, each mapped to a Jira epic. Each endpoint ships through two stability stages: `/v1-alpha` → `/v1` (see Endpoint Stability below).

| Group | Content | Status |
|---|---|---|
| 1 — Development | Commit activity, PR metrics, review turnaround | [E7](../PUBLIC_API_PLAN.md#epic-e7--endpoint-migration-phase-1-development) |
| 2 — Contributors | Contributor leaderboards, org breakdowns | [E8](../PUBLIC_API_PLAN.md#epic-e8--endpoint-migration-phase-2-contributors) |
| 3 — Popularity | Stars, forks, downloads, dependency counts | [E9](../PUBLIC_API_PLAN.md#epic-e9--endpoint-migration-phase-3-popularity) |
| 4 — Security & Best Practices | CVE counts, vulnerability summaries, scorecard | [E10](../PUBLIC_API_PLAN.md#epic-e10--endpoint-migration-phase-4-security--best-practices) |
| 5 — Overviews | Project health summaries and overview metrics | [E11](../PUBLIC_API_PLAN.md#epic-e11--endpoint-migration-phase-5-overviews) |
| 6 — Collections | User-curated project groups (requires permission check) | [E12](../PUBLIC_API_PLAN.md#epic-e12--endpoint-migration-phase-6-collections) |
| 7 — Leaderboard | Cross-project contributor and activity leaderboards | [E13](../PUBLIC_API_PLAN.md#epic-e13--endpoint-migration-phase-7-leaderboard) |

---

## Endpoint Stability

Each endpoint goes through two stages:

1. **`/v1-alpha/...`** — no contract guarantees. Breaking changes (field renames, shape changes, endpoint removal) are allowed freely. Access is restricted to an allow-listed cohort (LFX-internal + external design partners) for contract and performance validation.
2. **`/v1/...`** — full tolerant-reader contract. An endpoint graduates here once it passes the promotion criteria: load test passes, shape has been stable for at least one week, error/latency budgets are healthy, and security sign-off is given. From this point only additive changes are permitted within `/v1`; breaking changes require `/v2`.

Promotion is per-endpoint. The `/v1-alpha` route returns `410 Gone` for two weeks after promotion so alpha callers get a clear signal to update their URLs.

---

## Open Questions for Architecture Team

The following items are unresolved and need input before or during implementation:

| # | Question | Drives |
|---|---|---|
| 1 | Who is the named LFX Self-Serve contact for API key claims schema coordination? | [T-015](../PUBLIC_API_PLAN.md#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve) |
| 2 | Can a user belong to more than one org, or hold more than one membership tier? Affects how the rate-limit pool and tier are resolved per request. | [T-015](../PUBLIC_API_PLAN.md#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve) |
| 3 | Reuse existing `app.lfx.dev/settings` personal access token, or mint a new Insights-scoped token? See ADR-0015 for trade-off table. | [T-015](../PUBLIC_API_PLAN.md#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve) |
**Notes:**

- Deployed on the same Kubernetes cluster as `frontend/`. ([T-002](../PUBLIC_API_PLAN.md#epic-e1--foundation--framework))
- Using the existing Datadog org and APM agent in the cluster. ([T-025](../PUBLIC_API_PLAN.md#epic-e4--observability-opentelemetry--datadog))
- Hour-granularity datetime filters (`2024-01-01T14:00:00Z`) are supported and will be accepted.
- The most granular `granularity` option will be `daily` — no `hourly` option. ([E7](../PUBLIC_API_PLAN.md#epic-e7--endpoint-migration-phase-1-development)–[E11](../PUBLIC_API_PLAN.md#epic-e11--endpoint-migration-phase-5-overviews))
- API docs will be gated (not publicly indexable) until launch. ([E5](../PUBLIC_API_PLAN.md#epic-e5--api-documentation))
