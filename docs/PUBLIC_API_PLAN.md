# Insights Public API — Project Plan

> Draft plan for review. Not yet broken out into Jira tickets — once we agree on the shape, every "T-XXX" line below maps cleanly to a single Jira task and every "Epic" maps to an epic / milestone.

## 1. Context

Today, all `/api/*` endpoints live inside the Nuxt frontend (`frontend/server/api/`, ~106 endpoint files across 17 sub-folders). They were designed as **internal** endpoints for the insights UI:

- Authenticated via Auth0 OIDC cookie (browser session) or a single shared Bearer secret (`jwtSecret`) for a few report endpoints.
- Rate limited only by IP (Redis sliding window, 200 req/min default).
- No per-customer concept, no usage tiers, no SLAs, no public documentation, no contract guarantees.
- Coupled to the frontend release cycle — we cannot change endpoint shape without coordinating UI changes.

We want to expose a **public API** to LFX customers. Rather than retrofit the Nuxt routes, we will build a **standalone API service** that ports endpoints over with proper API key auth, tier-based access, rate limits, versioning, observability, and SLAs.

### Goals
- Standalone API app, independently deployable.
- API key auth via LFX Self-Serve (`app.lfx.dev/settings`) — customers receive refresh tokens; their code mints short-lived access tokens via Insights' proxied `/v1/auth/token` endpoint. Access tokens carry membership tier claims that drive both **rate limits** and **endpoint breadth**.
- URL-versioned (`/v1`, `/v2`); breaking changes only across versions.
- Heavy observability (OTel → Datadog) so we can offer SLAs and bill by tier confidently.
- Phased rollout: **Development → Contributors → Popularity → Security & Best Practices → Collections** (more later).
- Frictionless mechanism to port a Nuxt endpoint into the public API (probably a Claude skill).

---

## 2. Architecture Overview

```
┌─────────────────────┐  1. create token  ┌──────────────────────────────────┐
│  User (browser)     │ ────────────────▶ │  LFX Self-Serve App              │
│                     │                   │  app.lfx.dev/settings            │
│                     │ ◀──────────────── │  Issues + revokes refresh tokens │
│                     │  2. refresh token  │  Publishes JWKS endpoint         │
└─────────────────────┘                   └──────────────────┬───────────────┘
          │                                                   ▲
          │ 3. paste refresh token                            │ 4. forward
          │    into server env                                │    /token request
          ▼                                                   │
┌─────────────────────┐  POST /v1/auth/token  ┌──────────────┴──────────────────────────┐
│  Customer server    │ ────────────────────▶ │  api.insights.linuxfoundation.org        │
│                     │ ◀──────────────────── │  (Fastify, TypeScript)                   │
│                     │  5. access token       │                                          │
│                     │     (~15 min)          │  /v1/auth/token  (proxy)                 │
│                     │                        │  /v1/development/...                     │
│                     │  6. Bearer             │  /v1/contributors/...                    │
│                     │     <access_token>     │  /v1/popularity/...                      │
│                     │ ────────────────────▶  │  /v1/security/...                        │
└─────────────────────┘                        │  /v1/collections/...                     │
                                               └───────────┬──────────────┬──────────────┘
                            7. JWKS verify                 │              │
              (LFX Self-Serve JWKS — cached) ◀─────────────┘              │
                                                                          ▼
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
       │  Structured logs via pino, correlated to traces via trace_id           │
       │  (OTel hex format; Datadog ingests natively, no dd.trace_id needed).  │
       └────────────────────────────────────────────────────────────────────────┘
```

- **Location in monorepo:** `api/` at the repo root, sibling of `frontend/`. Add `api` to `pnpm-workspace.yaml`.
- **Shared code with frontend:** `libs/tinybird-client` (HTTP client, AdaptiveSemaphore, bucket routing), `libs/insights-types` (shared enums), `libs/rate-limiter` (Redis sliding-window primitive).
- **Tinybird:** dedicated read replica per app (goal — pending Tinybird team confirmation); fallback is a separate token/pipe set.
- **Postgres:** reuse existing read host with its own connection pool, separate from the frontend's.
- **Cache:** Redis for rate-limit counters + response cache (24h stable data, 1h time-series).

---

## 3. Open Decisions — Pros / Cons & Recommendations

Each decision below has a full pros/cons analysis and a recommendation. We are committing to these in this plan; there are no separate "spike" tasks. If we change our minds during implementation, that's fine — but the default direction is set.

### D1. Framework — NestJS vs Fastify vs Express vs Hono

| Option | Pros | Cons |
|---|---|---|
| **NestJS** | Opinionated structure (modules, controllers, providers, DI); batteries-included validation/guards/interceptors/pipes; mature `@nestjs/swagger` for OpenAPI; great for large APIs; familiar to anyone from Angular/Spring/.NET; CLI generators; strong DI-based testing story. | Heavy footprint and slower cold start; opinionated to the point of friction if you fight it; requires `experimentalDecorators` + `reflect-metadata`; steep learning curve for the team if not already on Angular-style DI; overkill for a read-only API. |
| **Fastify** ⭐ | ~2× throughput vs Express on Node; native JSON-Schema validation gives free serialization speedup; `@fastify/swagger` + `@fastify/type-provider-typebox` auto-generate OpenAPI from schemas with **zero spec drift**; mature plugin ecosystem; encapsulation via plugins; used under the hood by NestJS so we can wrap it later if we ever want Nest. | Less opinionated than Nest — team must enforce structure conventions; smaller community than Express; some plugins lag Express equivalents. |
| **Express** | Ubiquitous, every dev knows it, every middleware exists, simplest to debug, lowest learning curve. | No built-in validation or OpenAPI; ~half the throughput of Fastify; async error handling clumsy without wrappers; no opinionated structure — every team builds it differently; Express 5 has been "imminent" for years; least modern of the four. |
| **Hono** | Edge-native (Workers, Vercel, Bun, Node), fastest of the four; modern ergonomic API; first-class TypeScript; built-in Zod/Valibot/TypeBox validators; tiny bundle; great OpenAPI middleware. | Newer ecosystem; smaller community than Fastify/Express; fewer pre-built middlewares; Node-at-scale story less battle-tested than Fastify (most case studies are edge); team would need to learn it. |

**Recommendation: Fastify.** Code-first OpenAPI via TypeBox is essentially free, the schema-driven serializer is a real perf win, it's opinionated enough to give us structure without the Nest tax, and it's battle-tested on Node at scale. Hono is the runner-up if we ever want to deploy at the edge.

### D2. Docs Tool — Mintlify vs Scalar vs Stoplight Elements vs VitePress + Swagger UI

| Option | Pros | Cons |
|---|---|---|
| **Mintlify** ⭐ (if budget approved) | Best-in-class hosted polish (Anthropic, Cursor, Cloudflare use it); MDX guides + auto-generated OpenAPI reference in one product; built-in search; AI assistant baked in (customers chat over docs); analytics + CDN included; great onboarding flows. | Paid (≈$150–$550/mo team tier; enterprise priced separately); content lives on their infra; customization constrained by their conventions. |
| **Scalar** ⭐ (OSS fallback) | OSS, "Stripe-like" reference UI — easily the prettiest of the OSS options; embeddable into anything (Vue/VitePress/Next/Hono); best-in-class OpenAPI rendering; built-in "try it" client; fast; well-funded team behind it. | Just a reference renderer — you bring your own narrative/guide layer (we'd marry it with VitePress for guides); smaller team than Stoplight; theming is configurable but less plug-and-play than Mintlify. |
| **Stoplight Elements** | OSS web component; drop-in API reference; mature (Stoplight has been doing this for years); high OpenAPI 3.x fidelity. | Looks dated next to Scalar/Mintlify; Stoplight's commercial focus is on Stoplight Platform — OSS Elements gets less love; weak narrative-doc story. |
| **VitePress + Swagger UI** | VitePress already in repo (powering `/docs` and `/blog`); zero new tooling; full control; Swagger UI is the most universally-recognized OpenAPI viewer. | Swagger UI is ugly and dated; integration is DIY; "try it" UX is mediocre; reference + guides feel disjointed (two render styles). |

**Decision: VitePress + Scalar under `api/docs/`.** Standalone VitePress site co-located with the API service. Scalar embedded for the interactive OpenAPI reference, reading the generated spec — the reference cannot drift. Deployed independently of the frontend with its own subdomain.

### D3. OpenAPI Source — Code-first vs Spec-first

| Option | Pros | Cons |
|---|---|---|
| **Code-first (TypeBox or Zod → OpenAPI)** ⭐ | Schema lives next to the handler — single source of truth; types derived automatically (`Static<typeof Schema>`); spec literally cannot drift from implementation; framework integrations (Fastify+TypeBox) are turnkey; validation + OpenAPI from one schema; refactors stay safe. | Spec is generated — pre-implementation contract review is awkward; harder for PMs/technical writers to propose changes via PR; design-first workflows feel inverted. |
| **Spec-first (hand-written `openapi.yaml`)** | Contract exists before code; easy for non-engineers to review/comment; language-agnostic; can drive both server and client codegen; classic API-design discipline. | Drift is the #1 failure mode — handlers diverge from spec silently unless you wire heavy contract tests; two sources of truth; refactoring is painful; TS-side codegen tooling is mediocre. |

**Recommendation: code-first via TypeBox** (paired with Fastify per D1). For a 100+ endpoint surface area, drift is a near-certainty in spec-first; code-first inverts the failure mode — handlers cannot lie about their schemas.

### D4. Endpoint Conversion Tooling — Claude Skill vs Codegen Script vs Manual

| Option | Pros | Cons |
|---|---|---|
| **Claude Code skill** ⭐ (`.claude/skills/nuxt-to-api/`) | Handles variance in Nuxt route shapes (different validation styles, response patterns, error conventions); can update related artifacts (handler + TypeBox schema + integration test + OpenAPI tag + docs stub) in one pass; can ask follow-up questions when ambiguous; lives in-repo and improves iteratively; matches existing `.claude/rules/*` and `.claude/skills/*` workflows. | Non-deterministic — different runs may produce slightly different code (mitigated by mandatory PR review and tests); skill quality can drift over time without maintenance. |
| **Codegen script (AST-based)** | Deterministic; reproducible; could run in CI to enforce conformance. | Nuxt handlers vary too much for clean AST transforms (H3 helpers, inline TB queries, custom middlewares); you spend more time building the codegen than the API; LLMs end up doing the last-mile cleanup anyway. |
| **Manual port** | Maximum control; zero tooling overhead. | ~100 endpoints × 1–2 h each ≈ 100–200 h of repetitive work; high copy-paste error rate; pattern drift across endpoints. |

**Recommendation: Claude skill.** This codebase already has `.claude/skills/` and `.claude/rules/` infrastructure, and this is exactly the kind of repetitive structured port the skill model was designed for. Every conversion lands in a PR with tests, so non-determinism is a non-issue.

### D5. Datadog Metrics Strategy — Custom Metrics vs APM Trace Metrics

| Option | Pros | Cons |
|---|---|---|
| **Custom metrics** (DogStatsD / OTel metrics → DD custom metrics) | Explicit metric names; dashboards/monitors trivial to build; predictable aggregation semantics; fast queries. | Billed per unique tag-combination per metric (≈$0.05/series/month above quota); cardinality explosion is easy and expensive; high-cardinality dimensions (`customer_id`, `api_key_id`) blow the budget fast. |
| **APM trace metrics** (derived from span attributes) | Slicing by span attributes is not billed as custom metrics; can slice by `customer_id` / `api_key_id` without cost spike; flame-graph + latency-breakdown per request; ingestion cost is per-span, not per-tag. | APM has its own ingestion cost; span sampling can drop rare events at scale; alerting ergonomics are slightly different; counters for rate-limit rejections still want every event. |
| **Hybrid (both)** ⭐ | Low-cardinality custom metrics for SRE dashboards/alerting; high-cardinality slicing happens in APM; cost-controlled and complete. | Two systems to learn; need a clear rule for "what goes where" (covered in §6). |

**Recommendation: Hybrid.** A small set of low-cardinality custom metrics (tags: `endpoint`, `version`, `tier`, `status_class`) for dashboards and alerts, and APM trace metrics (span attributes: `customer_id`, `api_key_id`, `bucket_id`, `pipe_id`, numeric `status_code`) for per-customer drilldowns. Catalog in §6.

---

## 4. Epics / Milestones for Jira

Recommended ordering: **E1 → E2 → E3 (in parallel with E4, E5) → E6 → E7 (Development) → E8 (Contributors) → ...**

### Epic E1 — Foundation & Framework

Bootstrap the standalone service per §3 D1 (Fastify) and share code with frontend.

- **T-001** Bootstrap `api` package in pnpm workspace with **Fastify + TypeScript + TypeBox** (per §3 D1, D3). ESLint/Prettier matching repo conventions. Include `@fastify/swagger` and `@fastify/type-provider-typebox`.
- **T-002** Dockerfile + Helm/Terraform/whatever the repo uses for deploy. Stage and prod environments.
- **T-003** CI: lint, typecheck, test, build, image push (mirror frontend pipeline).
- **T-004** Extract Tinybird client (`adaptive-semaphore.ts`, `bucket-cache.ts`, `TinybirdResponse<T>` type, core HTTP fetch logic) into `libs/tinybird-client`. Replace `ofetch` with native `fetch` (Node 18+). Remove Luxon and H3/Nuxt-specific dependencies — the lib is framework-agnostic. Frontend and API both depend on it.
- **T-005** Extract shared enum definitions (`ActivityPlatforms`, `ActivityTypes`, `Granularity`) into `libs/insights-types`. Request/response shape types are defined separately in each app — the frontend keeps its Luxon-based types; `/api` defines its own TypeBox schemas.
- **T-006** Standard health endpoints: `/health/live`, `/health/ready` (TB ping, Redis ping, PG ping).
- **T-007** Error envelope ADR + Fastify error hook — single shape for all errors (`{ error: { code, message, requestId, docsUrl } }`).
- **T-008** Wire OTel trace ID as the request ID — error envelope's `requestId` = OTel trace ID. Inbound `traceparent` honoured via the W3C propagator (auto); outbound calls inject it automatically. W3C `traceparent` is the sole HTTP propagation channel — no `X-Request-Id` response header. No separate ULID generator (per ADR-0019).
- **T-009** Local dev story: `pnpm dev` from `api/`, hot reload via `tsx watch` or `fastify-cli`, env file template.

### Epic E2 — Tinybird Read Replica

Prepare upstream so the API does not contend with the frontend for TB capacity.

- **T-010** Contact Tinybird support to confirm whether per-app dedicated read replicas are supported. Owner: <eng lead>.
- **T-011** Track TB response; if available, set up the replica and wire its host/token into env config.
- **T-012** Fallback plan if TB does not offer per-app replicas: provision a **separate Tinybird workspace** or **separate token with workload class** for the API. ADR documenting trade-offs.
- **T-013** Move TB token + host config to runtime env (`API_TB_TOKEN`, `API_TB_HOST`).
- **T-014** Add upstream Tinybird latency + error metrics (covered in E4) so we can compare replica vs frontend behavior.

### Epic E3 — Auth & Rate Limiting (API Keys via LFX Self-Serve)

Per-key auth with tier-aware authorization and rate limiting. Reuse existing LFX membership tiers — we consume them from JWT claims, we don't invent a new tier model.

- **T-015** Coordinate with the LFX Self-Serve team: confirm the JWKS endpoint URL, the JWT claim names for `org` and `tier`, the `iss` value, the access-token lifetime (target: ~15 min), the `/token` endpoint shape on Self-Serve (RFC 6749 §6 `grant_type=refresh_token`), and **resolve the open question of whether the Insights API reuses the existing `app.lfx.dev/settings` personal access token as the refresh token or mints a new Insights-scoped refresh token** (see §9 Open Questions and ADR-0015).
- **T-015b** Implement `POST /v1/auth/token` proxy in Insights — forwards request body and headers to Self-Serve's `/token` verbatim, returns the response verbatim. Maps Self-Serve unreachable to `503 upstream_unavailable`. This is the sole endpoint customers use to exchange refresh tokens for access tokens.
- **T-016** ADR: API key claims schema + tier → capability matrix (which existing LFX tiers map to which endpoints and rate limits). Reference LFX Self-Serve as the claims issuer.
- **T-017** Access token verification middleware: verify JWT signature of the **access token** against the LFX Self-Serve JWKS endpoint, cache JWKS, accept `Authorization: Bearer <access_token>`. Insights never receives refresh tokens on `/v1/...` endpoints. Reject tokens whose `iss` does not match the configured LFX Self-Serve issuer (and `aud`, if the open question lands on a scoped token).
- **T-018** Tier-based authorization: route-level decorator/config that checks the key's tier against the route's required tier, lives next to the route definition.
- **T-019** Per-org rate limiting (Redis sliding window) — extract only the Redis sorted-set sliding-window primitive from `frontend/server/utils/rate-limiter.ts` into `libs/rate-limiter`. The public API writes its own org-aware wrapper keyed by `org_id` on top of this primitive. The IP-based identity resolution and H3-specific code stays in the frontend.
- **T-020** Standard rate-limit response headers (`X-RateLimit-*`, `Retry-After`) and 429 envelope.
- **T-021** Document and test the revocation flow: revoking a refresh token in `app.lfx.dev/settings` causes the next `POST /v1/auth/token` (forwarded to Self-Serve) to return `400 invalid_grant`; in-flight access tokens expire naturally (~15 min). Insights has nothing to delete or maintain. Cover in an integration test.
- **T-022** Customer-facing docs: explain the refresh-token / access-token split; provide a ~30-line `getAccessToken()` snippet pointing at `api.insights.linuxfoundation.org/v1/auth/token`. Link to `app.lfx.dev/settings` for token creation — Insights docs do not duplicate that flow.

### Epic E4 — Observability (OpenTelemetry + Datadog)

No hard SLAs in v1 — everything is **observational** for now. Implements the hybrid strategy from §3 D5.

- **T-023** Integrate OpenTelemetry SDK (`@opentelemetry/sdk-node`): HTTP auto-instrumentation, Postgres auto-instrumentation, custom spans around Tinybird calls. W3C TraceContext propagator (default). Span attributes carry high-cardinality dimensions (`customer_id`, `api_key_id`, `bucket_id`, `pipe`, numeric `status_code`). Per ADR-0019.
- **T-024** Implement low-cardinality custom metrics per §6 catalog. Helper module so handlers emit consistently.
- **T-025** Add `opentelemetry-collector` sidecar to the API pod spec. Configure the SDK to export OTLP to `localhost:4317`. Collector forwards to Datadog in prod/staging; stdout exporter in local dev (per ADR-0019).
- **T-026** Datadog dashboards: per-endpoint, per-tier, per-customer top-N (via APM trace metrics), upstream TB health.
- **T-027** Datadog monitors: 5xx rate, TB failure rate, auth-failure spike, rate-limit-rejection spike. Latency thresholds left open — we baseline first, then dial in.
- **T-028** Structured JSON logging (pino), shipped to Datadog Logs with trace correlation (per ADR-0018). Logs include `trace_id`/`span_id` (OTel hex format); Datadog ingests OTel-format IDs natively.

### Epic E5 — API Documentation

Implements §3 D2. **VitePress + Scalar** under `api/docs/` — standalone site co-located with the API service, deployed independently of the frontend.

- **T-029** Bootstrap `api/docs/` as a VitePress site — quickstart, authentication, pagination, error codes, changelog pages.
- **T-030** Embed Scalar on the reference page; wire it to ingest the generated OpenAPI spec (`api/openapi.json`) on every release. Serve the static VitePress build at `api.insights.linuxfoundation.org/docs` via Fastify's static file serving under `/docs`.
- **T-031** Wire Fastify OpenAPI export so docs ingest the generated spec on every release.
- **T-032** Quickstart guide: auth, first request, error envelope, rate limits.
- **T-033** Per-tier capability matrix in docs.
- **T-034** Changelog + deprecation page.

### Epic E6 — Versioning

Implements URL-prefix versioning (`/v1`, `/v2`).

- **T-035** ADR: URL-prefix versioning. Why URL over headers: discoverability, easier caching, simpler customer code samples.
- **T-036** Version routing structure in Fastify: separate router trees per version, not flag-based branching inside handlers.
- **T-037** Per-version OpenAPI artifact (one spec per version, served at `/v1/openapi.json`).
- **T-038** Deprecation/Sunset header support (`Deprecation: true`, `Sunset: <date>`, `Link: <docs>; rel="deprecation"`).
- **T-039** Version-bumping playbook: introducing v2 of an endpoint while keeping v1 stable. Shared upstream code where possible (handler imports a `v1Mapper` / `v2Mapper`).

### Epic E7 — Endpoint Migration Phase 1: Development

One ticket per endpoint. Each ticket: port handler, define TypeBox schema, write integration test, OpenAPI tag, document, ship to production (soft-launch model — per §9 #23). No feature flag.

- **T-040** Inventory all `frontend/server/api/**` endpoints used by the Development tab. Produce a checklist.
- **T-041 .. T-04N** One task per endpoint (N tickets — fill in once T-040 is done). Each uses the `nuxt-to-api` skill (E14). Each endpoint goes live to production when its ticket completes — no batched "Phase 1 launch" event (per §9 #23 soft-launch model).

### Epic E8 — Endpoint Migration Phase 2: Contributors
- Inventory + one ticket per endpoint + launch.

### Epic E9 — Endpoint Migration Phase 3: Popularity
- Same shape.

### Epic E10 — Endpoint Migration Phase 4: Security & Best Practices
- Same shape.

### Epic E11 — Endpoint Migration Phase 5: Overviews
- Same shape.

### Epic E12 — Endpoint Migration Phase 6: Collections
- Same shape as earlier endpoint groups, plus:
- **Collections Postgres queries:** `/api` writes its own minimal read-only SQL queries directly — no shared repo lib with the frontend. The frontend's `communityCollection.repo.ts` is write-heavy and Nuxt-coupled; the API only needs ~3 read queries (get by slug, list, permission check).

### Epic E13 — Endpoint Migration Phase 7: Leaderboard
- Same shape.

### Epic E14 — Endpoint Conversion Tooling




Implements §3 D4 (Claude skill).

- **T-080** Build the skill `nuxt-to-api` (under `.claude/skills/`):
  - Input: a Nuxt endpoint path (e.g. `frontend/server/api/development/...`).
  - Reads the Nuxt handler, request validation, response shape.
  - Emits a Fastify handler in `api/src/routes/v1/<group>/[slug]/<name>.ts` (slug mirrored in directory structure, matching Nuxt convention) with TypeBox schema, OpenAPI tags, route-level tier requirement, and a passing integration test.
  - Adds entries to docs (or at least a stub) and to the per-version OpenAPI.
- **T-081** Test the skill on 3 representative endpoints from the Development tab; iterate.
- **T-082** Document the skill in `CONTRIBUTING.md` of `api`.
- **T-083** Cursor pagination rewrite: the skill must convert Nuxt `page`/`pageSize`/`total` handlers (and `limit`/`offset` variants) into cursor-based handlers — encoding `{ k, id }` as `base64url`, using the lookahead-LIMIT trick (`LIMIT pageSize + 1`) to set `nextCursor` without a second count query, and dropping the `total` field from the response.

### Epic E15 — Key Management Entry Point (LFX Insights Frontend)

Key creation, listing, and revocation live entirely in the LFX Self-Serve App (per ADR-0015). The LFX Insights frontend only needs a small placeholder that deep-links to `app.lfx.dev/settings`.

- **T-095** Add a `/settings/api-keys` page in the LFX Insights frontend with a single "Manage API keys" CTA that opens `app.lfx.dev/settings` in a new tab. No list, no create, no revoke UI.
- **T-096** Closed-alpha gating signal: surface a "request access" state for users whose org is not on the closed-alpha allowlist ([T-089](#epic-e16--pre-launch)), so they understand why their key (if any) returns 403 against `/v1-alpha`.

### Epic E16 — Pre-Launch

These are the gates for the **launch** (per §9 #23) — not for individual endpoints, which roll out per-endpoint through closed alpha → silent public.

- **T-090** Load testing (k6 or artillery) — establish baseline req/s per pod, validate rate limiter under load. Required gate for promoting an endpoint from closed alpha → silent public.
- **T-091** Tier-to-API-access mapping finalized with product (per §9 #2 reuses existing LFX tiers, but rate-limit numbers per tier need product sign-off).

---

## 5. Endpoint Rollout Order (recap)

1. Development
2. Contributors
3. Popularity
4. Security & Best Practices
5. Overviews
6. Collections
7. Leaderboard
8. (more — to be decided)

Each phase = one epic = many tasks (one per endpoint).

---

## 6. Datadog Metrics Catalog (Initial)

Implements the hybrid strategy from §3 D5. **Tags = low cardinality** (billed as custom metrics). **Span attributes = high cardinality** (free in APM trace metrics).

Cost reminder: Datadog bills custom metrics per unique tag-combination per metric (≈$0.05/series/month above the included quota); high-cardinality tags multiply fast. Span attributes do not count toward custom-metric billing.

| Metric | Type | Tags (low-card) | Span attribute (high-card) | Why |
|---|---|---|---|---|
| `api.request.count` | Counter | `endpoint`, `version`, `status_class` (2xx/4xx/5xx), `tier` | `customer_id`, `api_key_id`, `status_code` | Throughput by route/tier |
| `api.request.duration` | Histogram | same as above | same | Latency p50/p95/p99 |
| `api.tinybird.duration` | Histogram | `pipe`, `status_class` | `query_id`, `bucket_id` | Upstream latency |
| `api.tinybird.errors` | Counter | `pipe`, `error_type` | `query_id`, `customer_id` | Upstream reliability |
| `api.postgres.duration` | Histogram | `query_name`, `status_class` | `customer_id` | DB latency |
| `api.ratelimit.rejections` | Counter | `tier`, `endpoint` | `customer_id`, `api_key_id` | Customers hitting limits |
| `api.auth.failures` | Counter | `reason` (invalid_jwt / expired / revoked / missing) | `api_key_id` (when known) | Auth bypass attempts |
| `api.cache.hit_ratio` | Gauge | `cache_layer` | — | If we add response caching |
| `api.concurrency` | Gauge | — | — | Adaptive semaphore depth |

**Cardinality budget (initial):** roughly `~25 endpoints × 4 tiers × 3 status_class × 2 versions ≈ 600 timeseries per metric` × 9 metrics ≈ 5.4k custom timeseries. Well within reasonable cost.

**Things we will NOT tag:** `customer_id`, `api_key_id`, numeric `status_code`, `bucket_id`, `pipe_id`. These ride on spans (APM trace metrics, not billed as custom metrics) so we can still slice by them in Datadog APM and Logs.

---

## 7. Critical Files / Areas to Reference During Implementation

- `frontend/server/data/tinybird/tinybird.ts` — TB client with `AdaptiveSemaphore`, bucket routing, response typing. Extract to shared lib ([T-004](#epic-e1--foundation--framework)).
- `frontend/server/data/types.ts` — shared filter shapes (`DefaultFilter`, `ActiveContributorsFilter`, etc.). These are **not** extracted to a shared lib — `/api` defines its own TypeBox equivalents per endpoint (filter shapes are TypeBox schemas, not shared runtime types). Use this file as a reference when porting handlers.
- `frontend/server/utils/rate-limiter.ts` — Redis sliding-window implementation; extract the core primitive into `libs/rate-limiter`, write a new org-aware wrapper in `/api` keyed by `org_id` ([T-019](#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve)).
- `frontend/server/utils/jwt.ts` — existing Bearer/JWT helper (`auth(event)`). Conceptually closest to the public-API auth but uses one shared secret; we'll replace the verify step with the LFX Self-Serve JWKS endpoint (per ADR-0015), not Auth0 JWKS ([T-017](#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve)).
- `frontend/setup/rate-limiter.ts` — current rate-limiter rules. Inspiration for tier-based rules.
- `frontend/server/api/development/**` — all endpoints to inventory in [T-040](#epic-e7--endpoint-migration-phase-1-development).
- `pnpm-workspace.yaml` — currently lists `frontend`, `workers/*`. Add `api` and `libs/*` entries when bootstrapping ([T-001](#epic-e1--foundation--framework)).

---

## 8. Verification (post-implementation)

- Unit + integration tests per endpoint (mocked TB).
- Contract tests against staging TB for each endpoint family.
- Load test ([T-090](#epic-e16--pre-launch)) against staging cluster.
- Security review ([T-091](#epic-e16--pre-launch)).
- Datadog dashboards green for 72h on stage with synthetic traffic before GA per phase.
- One real partner integration completed end-to-end before declaring a phase GA.

---

## 9. Decisions So Far + Remaining Open Questions

**Decided (this plan):**

1. **Location:** monorepo, `/api` at the repo root (sibling of `frontend/`). Add `api` to `pnpm-workspace.yaml`.
2. **Tiers:** reuse existing LFX membership tiers — consumed as JWT claims, no new tier model.
3. **SLAs:** observational only in v1. No numeric latency/uptime commitments yet.
4. **Framework:** Fastify (§3 D1).
5. **OpenAPI source:** code-first via TypeBox (§3 D3).
6. **Versioning:** URL prefix `/v1`, `/v2` (§3 + E6).
7. **Conversion tooling:** Claude skill `nuxt-to-api` (§3 D4). Produces a complete, ready-to-review Fastify handler (TypeBox schema, Tinybird/Postgres calls, response mapping, integration test) — not a skeleton. Developer's job is review, not writing.
8. **Datadog strategy:** hybrid — low-card custom metrics + APM trace metrics for high-card slicing (§3 D5, §6).
9. **Docs tool:** VitePress + Scalar (§3 D2). Standalone site under `api/docs/`, co-located with the service, deployed independently. Scalar embedded on the reference page, reads generated OpenAPI spec.
10. **Customer model:** the API principal is a **user** (`sub` = user ID, used for the `customer_id` field in error envelopes). The user's **organization** (`org` claim, exact name confirmed at T-015) drives **tier and rate-limit pool** — multiple users in the same org share one rate-limit pool. Both claims come from the LFX Self-Serve JWT (per ADR-0015). The exact claim names, behavior when a user has no org, and behavior when a user belongs to multiple orgs are follow-ups for T-015 with the LFX Self-Serve team. Whether the token is an existing platform PAT or a new Insights-scoped token is the open question at §9 #4.
11. **Data scope (v1):**
    - **Phases 1–4 (Development, Contributors, Popularity, Security & Best Practices):** public OSS data, **no per-project permission check**. Tier check only.
    - **Phase 5 (Collections):** tier check + permission check (private collections gated by ownership/membership; public collections open to all valid keys). Permission source: **Postgres lookup with Redis cache** (~60s TTL). Decision deferred to Phase 5 — does not block earlier phases.
    - No general project-membership authorization graph in v1.
12. **Authentication floor:** every request requires a valid API key. No anonymous access path. 401 on missing/invalid key, full stop.
13. **Caller scope (v1):** server-to-server only. CORS responds with no `Access-Control-Allow-Origin` for the API, which blocks browser callers. **Revisit before GA** — we may extend to browser support (per-key origin allowlist or a publishable+secret key model) if customer demand emerges. Track as a follow-up.
14. **Billing model:** bundled with existing LFX membership. No standalone billing infra in v1. Tier comes from the existing LFX tier on the user's org. Usage is metered only for rate-limit enforcement and Datadog dashboards — not for invoicing. Enforcement is split: (a) **token-mint time** — Self-Serve validates Key Contact status via OpenFGA `v2_organization` entities before issuing an Insights access token; the precise moment depends on the PAT model (new Insights-scoped refresh token → check at issuance; existing PAT reused → check at `/v1/auth/token` exchange time — open question ADR-0015 Q1); either way, non-Key-Contacts never receive a valid Insights access token; (b) **request time** — the Insights API reads `tier` and `org` from the JWKS-verified claims on every request to enforce rate limits and future per-endpoint tier gating, but never re-queries OpenFGA or any membership system. See ADR-0010.
15. **Pagination:** cursor-based. Request: `cursor` (opaque base64url, omit on first page) + `pageSize` (default 50, max 200). Response: `{ data, pageSize, nextCursor }`; `nextCursor: null` indicates end of list. No `total` field (counting on every request doubles Tinybird load). Cursor-based chosen over the Nuxt `page`/`pageSize` convention for stability under mutations, O(log N) cost vs offset scan, and fit with server-to-server iteration. See ADR-0011.
16. **URL port strategy:** **hybrid**. Default to port-as-is from Nuxt to `/v1/...`, applying only light normalization (kebab-case path segments, plural collection nouns). Rename only when the existing URL is **genuinely misleading** to an external developer. The `nuxt-to-api` skill ([T-080](#epic-e14--endpoint-conversion-tooling)) defaults to port-as-is and surfaces the URL for explicit reviewer approval; renames are a per-endpoint judgement call recorded in the PR.
17. **Versioning semantics ("breaking change" definition):** **tolerant-reader / additive-only**. Within a version, allowed: adding response fields, adding optional query params, adding endpoints, expanding accepted enum INPUT values, adding new error codes, adding new success status codes. Requires a major version bump: removing/renaming a response field, changing a field's type, making an optional input required, narrowing accepted input values, removing an endpoint, changing the error envelope shape, changing default or max pageSize, or changing the cursor encoding semantics. **Customers commit to ignoring unknown response fields** (documented prominently). Matches Stripe/GitHub/Google.
18. **Caching contract (v1):** origin-side Redis cache only (~5–60s TTL depending on endpoint). All responses set `Cache-Control: private, max-age=0` — customers do not cache, intermediaries do not cache. Lets us tune TTL without breaking customers. Public/CDN cache headers can be introduced later as a non-breaking improvement once we have real traffic data.
19. **JSON key casing:** **camelCase** for all request and response JSON keys (`startDate`, `activityTypes`, `includeCodeContributions`). The existing Nuxt code is mixed (some snake_case fields like `activity_types`); the `nuxt-to-api` skill normalizes these to camelCase at port time. Date values are ISO-8601 strings in UTC (`2025-12-31T23:59:59Z`) — committed as a convention, not a question.
20. **Tier gating (v1):** all tiers see all endpoints; **tiers control rate limits only** in v1. The per-route "required tier" mechanism IS built into the framework (so individual endpoints can be gated later without an architectural change), but every v1 endpoint declares the lowest tier. When a future endpoint is gated above a user's tier, the response is **403 with `code: tier_forbidden`** and the error envelope's `docsUrl` deep-links to the tier-capability matrix.
21. **API key lifecycle:** refresh tokens are long-lived with **no auto-expiry**. Access tokens are short-lived (~15 min, confirmed at T-015). Customers rotate refresh tokens manually via `app.lfx.dev/settings`. **Multiple active refresh tokens per user supported** so rotation is zero-downtime (mint new → switch → revoke old). Revocation enforced by LFX Self-Serve — once a refresh token is revoked, the next `POST /v1/auth/token` call returns `400 invalid_grant`; in-flight access tokens expire naturally. No Insights-side deny-list. Best practice rotation guidance documented but never forced.
22. **SDKs (v1):** none. Customers integrate against the OpenAPI spec directly, plus `curl`/`fetch`/`requests` examples in docs. SDK strategy revisited post-v1 once we see what languages customers actually use.
23. **Launch model:** Endpoints roll out per-endpoint through two stability stages:
    1. **`/v1-alpha`:** endpoint is served under `/v1-alpha/...` with no contract guarantees. Access is restricted to an allow-listed cohort (LFX-internal devs + external design partners). Breaking changes are allowed freely. Used to validate contract and performance before broad exposure.
    2. **`/v1`:** once the endpoint passes the promotion criteria (load test, one week stable shape with alpha cohort, error/latency budgets healthy, security sign-off), it graduates to `/v1/...` and the full tolerant-reader contract locks in. Open to all users with a valid API key. The `/v1-alpha` route returns `410 Gone` for two weeks after promotion.

**Still open:**

1. Can a Key Contact hold that role in more than one Organization, or carry more than one membership tier? If yes, the JWT must carry `org` as an array (or the user must re-mint choosing which org to act as), and the rate-limit pool resolution logic must handle multiple orgs. Confirm with LFX Self-Serve team at [T-015](#epic-e3--auth--rate-limiting-api-keys-via-lfx-self-serve).
2. Rate-limit numbers per LFX membership tier (Gold, Platinum, etc.) — TBD, pending product sign-off. Drives [T-093](#epic-e16--pre-launch).
3. **Reuse `app.lfx.dev/settings` personal access token as the refresh token, or mint a new Insights-scoped refresh token?** Drives the JWT claim shape, whether `aud` is required, and the LFX Self-Serve UI work. Trade-offs:
   - **Reuse:** one platform-wide refresh token across every LFX service — best UX. Compromise blast radius is wider than Insights alone, so a service-scope claim (e.g. `aud` or `scopes`) would be needed for Insights to safely refuse out-of-scope use. Requires LFX Self-Serve to ensure the existing token carries (or can be made to carry) `org` and `tier`.
   - **Mint new:** Insights-scoped refresh token isolated from the user's other LFX integrations; per-service revocation. Cost: extra "Create Insights API token" affordance in `app.lfx.dev/settings` and a new token type for LFX Self-Serve to support.

**Resolved:**
- Deployed on the same Kubernetes cluster as frontend. ([T-002](#epic-e1--foundation--framework))
- Using existing Datadog org and APM agent. ([T-025](#epic-e4--observability-opentelemetry--datadog))
- `granularity` most granular option will be `daily` — no `hourly`. (E7–E11)
- API docs gated until launch. (E5)
- Base URL: `https://api.insights.linuxfoundation.org/v1/...`
- Keys issued by LFX Self-Serve App (`app.lfx.dev/settings`); Insights stores no keys. (ADR-0015)
- Tinybird errors: serve stale Redis cache, 503 if no cache. (ADR-0016)
- Collections: read-only in v1, both metadata and analytics exposed.
- Slug validation: pass-through (unknown slugs return empty data, not 404).
- Repo-level filtering (`repos` param) exposed as-is across all endpoints.
- Integration test per endpoint required before promotion to `/v1`.
- Local dev uses real credentials via `.env` + Docker Redis.
