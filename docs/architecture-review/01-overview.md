# LFX Insights Public API — Architecture Review

**Date:** 2026-05-04  
**Author:** LFX Insights Engineering  
**Status:** Pending architecture team approval

**ADRs:** Architecture Decision Records are committed to the codebase at [`docs/adr/`](../adr/) alongside the code they describe. Future engineers can find the reasoning for any decision without hunting through wikis or Notion. ADRs are append-only — past decisions are never edited, only superseded by new ones.

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
| Auth | Personal Access Tokens issued by LFX Self-Serve; a Cloudflare Worker exchanges the PAT for a short-lived Auth0-signed JWT via Auth0 Custom Token Exchange on a cache miss (~10 min) and adds org/tier headers; Insights JWKS-verifies the JWT on every request |
| Rate limiting | Redis sliding window, per-org pool, tier-driven |
| Versioning | URL prefix (`/v1`, `/v2`); additive-only within a version |
| Contract | Tolerant-reader; no breaking changes within a major version |
| Docs | VitePress + Scalar at `api.insights.linuxfoundation.org/docs` (served by Fastify from `api/docs/`) |
| Observability | OpenTelemetry → Datadog (hybrid custom metrics + APM) |
| Callers | Server-to-server only in v1; CORS denies all browser origins |
| Billing | Bundled with existing LFX membership tiers; no standalone billing |
| SDKs | None in v1; OpenAPI spec + curl examples |

---

## Architecture

```
┌─────────────────────┐  1. create PAT    ┌──────────────────────────────────┐
│  User (browser)     │ ────────────────▶ │  LFX Self-Serve App              │
│                     │                   │  Developer Settings              │
│                     │ ◀──────────────── │  PAT service: issue / revoke,    │
│                     │  2. lfi_... (once) │  salted-hash storage             │
└─────────────────────┘                   └──────────────────────────────────┘
          │
          │ 3. paste PAT into server env
          ▼
┌─────────────────────┐  4. Bearer lfi_...   ┌─────────────────────────────────┐
│  Customer server    │ ───────────────────▶ │  Cloudflare Worker              │
│                     │                      │  (Insights zone)                │
└─────────────────────┘ ◀─────────────────── │  - detects lfi_ prefix          │
                          9. response        │  - Auth0 CTE exchange (5)       │
                                             │  - LFX Tier lookup (6)          │
                                             │  - caches both (~10 min)        │
                                             └──┬────────────┬─────────────────┘
              5. RFC 8693 token exchange (miss)│            │ 6. sub → org + tier
                       (Auth0 → PAT service     │            ▼
                        validates, returns JWT) │   ┌──────────────────────┐
                                                ▼   │  LFX Tier endpoint   │
                                       ┌──────────┐ └──────────────────────┘
                                       │  Auth0   │
                                       └──────────┘
                                             │
             7. Bearer <JWT> + org / x-tier headers
                                             ▼
                                     ┌─────────────────────────────────┐
                                     │  api.insights.linuxfoundation   │
                                     │  .org  (Fastify, TypeScript)    │
                                     │                                 │
                                     │  /v1/development/...            │
                                     │  /v1/contributors/...           │
                                     │  /v1/popularity/...             │
                                     │  /v1/security/...               │
                                     │  /v1/collections/...            │
                       8. JWKS verify └───────────┬─────────────────────┘
                     ┌────────────────────────────┴─────────┐
                     ▼                                      ▼
              (Auth0 JWKS endpoint — cached)
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

Personal Access Tokens (what customers call their "API key") are created and managed entirely in the LFX Self-Serve App's Developer Settings. The LFX Insights frontend deep-links to that page from a `/settings/api-keys` placeholder ([E15](../PUBLIC_API_PLAN.md#epic-e15--key-management-entry-point-lfx-insights-frontend)); it does not implement create / list / revoke. Membership gating (only Key Contacts in member organizations can create keys) is enforced by LFX Self-Serve, not by Insights. What the customer pastes into their environment is the PAT itself, sent directly as `Authorization: Bearer lfi_...` — the Cloudflare Worker exchanges it for a short-lived Auth0-signed JWT on a cache miss (~10 min TTL), so there is no client-side token-swap call and no Insights-hosted token endpoint (per ADR-0006 and ADR-0015).

Credentials come from the shared LFX PAT service, scoped to Insights by audience and by the `lfi_` prefix rather than by being a separate token type; see ADR-0006.

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
| 1 | The CTE / JWT / header contract: the `subject_token_type` URN and Worker client-auth method for the Auth0 exchange, the Auth0 `iss` and JWKS URL, the Insights `aud`, and the organization header name (unnamed in the 4b diagram). Self-Serve owner is named in ADR-0006; PATs are opaque, so there is no key-claims schema to agree. | [T-015](../PUBLIC_API_PLAN.md#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve) |
| 2 | Multi-org Key Contact resolution (decided, 2026-05-19 review call + 2026-08-10): highest tier wins and the organization ID connected to that tier is returned; on a tie between orgs at the same tier, the first one returned by the Tier endpoint is used as the rate-limit pool key. | [T-015](../PUBLIC_API_PLAN.md#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve) |
| 3 | Variant 4a vs 4b — is tier resolved by the Cloudflare Worker from the LFX Tier endpoint (4b, suggested) or enriched inside the PAT service (4a)? Insights stewards the call, with DevOps input. See [ADR-0006](../adr/0006-pat-token-exchange-for-api-credentials.md). | [T-015](../PUBLIC_API_PLAN.md#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve) |
**Notes:**

- Deployed on the same Kubernetes cluster as `frontend/`. ([T-002](../PUBLIC_API_PLAN.md#epic-e1--foundation--framework))
- Using the existing Datadog org and APM agent in the cluster. ([T-025](../PUBLIC_API_PLAN.md#epic-e4--observability-opentelemetry--datadog))
- Hour-granularity datetime filters (`2024-01-01T14:00:00Z`) are supported and will be accepted.
- The most granular `granularity` option will be `daily` — no `hourly` option. ([E7](../PUBLIC_API_PLAN.md#epic-e7--endpoint-migration-phase-1-development)–[E11](../PUBLIC_API_PLAN.md#epic-e11--endpoint-migration-phase-5-overviews))
- API docs will be gated (not publicly indexable) until launch. ([E5](../PUBLIC_API_PLAN.md#epic-e5--api-documentation))
