# Architecture Decisions

All decisions recorded here met the ADR bar: hard to reverse, surprising without context, result of a genuine trade-off. Full ADR files live in [`api/docs/arch/adr/`](../adr/).

---

## Service & Infrastructure

### Where the service lives — [api/docs/arch/adr/0002](../adr/0002-api-at-repo-root.md)

The API is a top-level directory `/api` at the repo root, sibling to `frontend/`, not inside `workers/`. The `workers/` tree is for background workers; `/api` is a long-running HTTP server with its own deployment unit, matching the `frontend/` precedent. Keeping it at the root makes `pnpm-workspace.yaml` membership and CI matrix entries symmetric.

### Framework: Fastify over NestJS — [api/docs/arch/adr/0001](../adr/0001-fastify-over-nestjs.md)

We chose Fastify over NestJS (the leading alternative) because: NestJS adds 3–5× boilerplate for a read-only proxy service; it couples schema validation to class-validator, where we want TypeBox (see ADR-0008); and Fastify's plugin isolation maps cleanly onto our endpoint-group structure. Express was rejected for lack of built-in validation and lower throughput. Hono was rejected because it is designed for edge runtimes (Cloudflare Workers, Deno Deploy) first and Node second — the Tinybird and Postgres clients rely on Node-native APIs (`net`, `tls`, `Buffer`) that edge runtimes don't provide, so running Hono on Node requires an adapter layer that reintroduces the compatibility risk Hono was chosen to avoid. Fastify is Node-native and battle-tested at scale with no runtime adapter between the framework and the OS.

### OpenAPI: TypeBox code-first — [api/docs/arch/adr/0008](../adr/0008-typebox-code-first-openapi.md)

TypeBox is a TypeScript library where a single object definition is simultaneously a valid JSON Schema (used at runtime) and a TypeScript type (used at compile time). A route schema like `Type.Object({ commitCount: Type.Number() })` both validates the incoming request at runtime and produces the TypeScript type `{ commitCount: number }` statically — no duplication and drift.

Fastify has first-class support for this pairing via `@fastify/type-provider-typebox`: it consumes TypeBox schemas directly for request validation and response serialization, and `@fastify/swagger` reads the same schemas to generate the OpenAPI spec automatically. The result is that the spec literally cannot diverge from the implementation — they are derived from the same object.

Zod was considered as an alternative (more ergonomic API, larger community) but rejected because Zod's native type is not JSON Schema — a conversion layer (`zod-to-json-schema`) is required, which reintroduces a transformation step that can drift. The Fastify+TypeBox integration is zero-transformation: the schema object _is_ the JSON Schema.

Hand-written OpenAPI YAML was rejected outright: with ~100 endpoints, drift between the YAML spec and the actual handler behavior is high maintenance. TypeBox is the single validation and schema boundary.

### API docs: VitePress + Scalar at `api.insights.linuxfoundation.org/docs` — [api/docs/arch/adr/0016](../adr/0016-vitepress-scalar-api-docs.md)

API docs live in `api/docs/site/` as a standalone VitePress site, served by Fastify under `/docs`. Scalar is embedded on the reference page and reads the generated OpenAPI spec — the reference cannot drift. Mintlify was rejected (paid, external infra). Extending `frontend/docs/` was rejected — API docs have their own release cadence and should not be coupled to the frontend deploy.

---

## Authentication & Authorization

### Every request requires a valid API key — [api/docs/arch/adr/0009](../adr/0009-api-key-required-for-all-requests.md)

All endpoints, including those serving public project data, require a valid API key. There is no unauthenticated path. A missing or invalid key returns 401 immediately. This is intentional: rate limiting requires a stable identity, and attribution data is essential for roadmap prioritization. 

### API keys are issued by the LFX Self-Serve App — [docs/adr/0015](../adr/0015-api-keys-issued-by-lfx-self-serve.md)

API keys are refresh tokens issued by the LFX Self-Serve App at `app.lfx.dev/settings`. Customer code exchanges refresh tokens for short-lived access tokens via `POST api.insights.linuxfoundation.org/v1/auth/token` — a thin proxy to Self-Serve's `/token` endpoint so customers configure only one host. The Insights API JWKS-verifies the access token on every request and reads `sub`, `org`, and `tier` from the verified claims — Insights stores no keys and runs no key-management UI of its own.

Whether the existing `app.lfx.dev/settings` personal access token is reused as the refresh token or a new Insights-scoped refresh token is minted is an open product question — see ADR-0015 and §9 of the plan.

Storing keys in Auth0 (and building an Insights-side management UI) was rejected because it duplicates a UI the LFX Self-Serve App already runs. Storing keys in our own Postgres was rejected — we'd own the signing key, the revocation surface, and the token lifecycle.

### Tiers control rate limits only in v1 — [api/docs/arch/adr/0005](../adr/0005-tiers-control-rate-limits-only.md)

All tiers see all endpoints in v1 (which are existing endpoints that power the widgets in Insights). The Tier attached to an Organization only determines the size of its Rate-limit Pool. The per-route "required tier" mechanism is built into the framework (future gating is a config change, not an architecture change), but every v1 endpoint declares the minimum tier. Engineers must not add per-endpoint tier checks without a product decision — doing so breaks callers who integrated assuming open access.

### Refresh tokens are long-lived; access tokens are short-lived — [docs/adr/0006](../adr/0006-refresh-and-short-lived-access-tokens.md)

Refresh tokens do not expire automatically. Multiple active refresh tokens per user are supported for zero-downtime rotation (mint new → switch → revoke old). Access tokens are short-lived (~15 min, confirmed at T-015). Revocation is owned by LFX Self-Serve — revoking a refresh token prevents future access token mints; in-flight access tokens expire naturally. No Insights-side deny-list or introspection endpoint needed.

### Collections-only permission check — [api/docs/arch/adr/0007](../adr/0007-collections-only-permission-check.md)

Endpoint Groups 1–5 (Development, Contributors, Popularity, Security, Overviews) expose aggregated public data — a valid API key is sufficient. Only Group 6 (Collections) requires a per-request ownership check (Postgres lookup, Redis-cached at 60s TTL) because Collections are user-created private groupings. Engineers must not add ownership checks to Groups 1–5.

### Collections Postgres queries written fresh in `/api` — [api/docs/arch/adr/0017](../adr/0017-collections-queries-not-shared.md)

The `/api` service writes its own minimal read-only Postgres queries for Collections rather than extracting a shared repo library. The frontend repo is write-heavy and Nuxt-coupled; the API only needs ~3 read queries. Engineers seeing what looks like duplicated SQL should not reflexively extract a shared repo — the duplication is deliberate.

---

## API Contract

### Tolerant-reader / additive-only versioning — [api/docs/arch/adr/0003](../adr/0003-tolerant-reader-versioning.md)

Endpoints go through two URL-level stability stages. During closed alpha they are served under `/v1-alpha/...` — no contract guarantees, shapes can change freely. When an endpoint graduates to silent public it moves to `/v1/...` and the full contract locks in: only additive changes are permitted (new response fields, new optional query params, new endpoints, expanded enum inputs, new error codes). Any removal, rename, type change, or constraint-tightening from that point requires a new major version prefix (`/v2`). Customers commit to ignoring unknown fields (documented prominently).

**Promotion from `/v1-alpha` to `/v1`** happens when: load test passes, the closed-alpha cohort has used the endpoint without shape changes for at least one week, error/latency budgets are healthy, and security sign-off is given. Mechanically: the `/v1` route is added in a PR, the `/v1-alpha` route is changed to return `410 Gone` with a `Link: </v1/...>; rel="successor-version"` header, the alpha cohort is notified directly, and both routes coexist for a minimum of 2 weeks before the `410` handler is removed.

When a field, parameter, or endpoint needs to eventually be removed, the deprecation process is: (1) annotate it as `DEPRECATED:` in the TypeBox schema so it surfaces in the OpenAPI spec; (2) add `Deprecation: true`, `Sunset: <date>`, and `Link: <migration-guide>; rel="deprecation"` response headers on every response from that route; (3) publish a changelog entry and notify known consumers; (4) honour the sunset window — removal before the `Sunset` date is a contract violation; (5) do the actual removal in `/v2`, not `/v1`. Full details in [api/docs/arch/adr/0003](../adr/0003-tolerant-reader-versioning.md).

### Pagination: cursor-based — [docs/adr/0011](../adr/0011-pagination-cursor-based.md)

All paginated endpoints accept `cursor` (opaque base64url, omit on first page) + `pageSize` (default 50, max 200) and return `{ data, pageSize, nextCursor }`. `nextCursor: null` means end of list. No `total` field — counting on every request doubles Tinybird load and offset semantics don't fit cursor pagination.

Cursor-based was chosen over the existing Nuxt `page` + `pageSize` convention for three reasons: (1) stability under inserts/deletes (offset pagination skips or duplicates rows when the underlying set mutates between calls — common for live analytics); (2) O(log N) cost on an indexed sort key vs O(N+offset) for `LIMIT … OFFSET`; (3) v1 is server-to-server, so callers iterate end-to-end and don't need "jump to page 5" UI affordances. Industry alignment (Stripe, GitHub, AWS, Linear) is a side benefit.

The `nuxt-to-api` skill rewrites Nuxt's `page`/`pageSize`/`total` handlers (and `limit`/`offset` handlers) into cursor handlers at port time. Top-N leaderboards (hard-capped, no second page) and time-series charts stay non-paginated.

Sort order is caller-selectable from a per-endpoint allow-list (`?sort=name_asc`, `?sort=commits_desc`). Each accepted `sort` value is index-backed; values outside the list return `400 invalid_sort`. Removing an allowed value or changing an endpoint's default sort is a breaking change per ADR-0003. Full details in [docs/adr/0011](../adr/0011-pagination-cursor-based.md).

### camelCase JSON + ISO-8601 UTC dates — [api/docs/arch/adr/0014](../adr/0014-camelcase-json-iso8601-dates.md)

All JSON keys are camelCase (`startDate`, `activityTypes`). Dates are ISO-8601 UTC strings (`2025-12-31T23:59:59Z`), never Unix timestamps. The existing Nuxt layer is mixed (some snake_case fields mirror Tinybird's internal naming); the `nuxt-to-api` skill normalizes at port time. Coupling the public contract to Tinybird field names was rejected because it would make Tinybird schema changes into API breaking changes.

### URL porting: hybrid, rename only when genuinely misleading — [api/docs/arch/adr/0012](../adr/0012-url-port-strategy-hybrid.md)

The default is to port-as-is from Nuxt to `/v1/...` with light normalization (kebab-case, plural nouns). Renaming happens only when the existing URL is genuinely misleading to an external developer. Any rename must be recorded in the PR. Wholesale renaming was rejected as a large diff with no functional change, obscuring the real porting work.

### v1 is server-to-server only; CORS denies all browser origins — [api/docs/arch/adr/0004](../adr/0004-server-to-server-cors-deny.md)

`Access-Control-Allow-Origin` is absent for the API — this is intentional. Allowing browser origins in v1 would require a CORS policy, credential-safe key distribution, and potentially cookie-based auth — all out of scope. **Flagged for revisit before launch** Will we need browser-side access? 

---

## Operations & Cost

### Caching: origin Redis only, `Cache-Control: private` — [api/docs/arch/adr/0013](../adr/0013-origin-cache-only-private-cache-control.md)

All responses carry `Cache-Control: private, max-age=0`. A Redis cache with two TTL tiers lives at the origin: 24h for stable data (project lists, leaderboards, categories), 1h for time-series analytics. Clients and CDNs do not cache. This keeps a single TTL knob we can tune without a contract change, and avoids accidental public caching of org-scoped Collection responses.

### Billing bundled with LFX membership — [api/docs/arch/adr/0010](../adr/0010-billing-bundled-with-lfx-membership.md)

API access is included in the user's existing LFX membership tier. No separate billing infrastructure or usage-based pricing in v1.

Enforcement is split across two boundaries:

- **Token-mint time (LFX Self-Serve):** Self-Serve checks Key Contact status via OpenFGA `v2_organization` entities before issuing an Insights access token. The precise moment depends on the PAT model (open — ADR-0015 Q1): with a new Insights-scoped refresh token the check happens at token issuance; with the existing PAT reused, the check happens at `POST /v1/auth/token` exchange time. Either way the check is in Self-Serve; non-Key-Contacts never receive a valid Insights access token.
- **Request time (Insights API):** Insights verifies the JWT signature, reads `tier` and `org` from the verified claims, and uses them for rate limits and future per-endpoint tier gating. It never re-queries OpenFGA or any membership system.

Revoking a membership does not immediately invalidate existing refresh tokens — full details in [docs/adr/0010](../adr/0010-billing-bundled-with-lfx-membership.md).

### Datadog: hybrid custom metrics + APM trace metrics — [PUBLIC_API_PLAN.md §3 D5 + §6](../PUBLIC_API_PLAN.md#d5-datadog-metrics-strategy--custom-metrics-vs-apm-trace-metrics)

Low-cardinality custom metrics (tags: `endpoint`, `version`, `tier`, `status_class(2xx,4xx,5xx)`) power SRE dashboards and alerting. High-cardinality dimensions (`customer_id`, `api_key_id`) live in APM span attributes — not billed as custom metrics. Estimated budget: ~5,400 timeseries at ~$270/mo above DD quota. Pure custom metrics were rejected because per-customer cardinality would blow the cost budget.

### Structured JSON logging via pino — [docs/adr/0018](../adr/0018-structured-json-logging.md)

pino emits single-line JSON to stdout (no literal newlines, no leading/trailing characters), collected and shipped to Datadog Logs by the cluster log collector. Log levels follow the LFX platform standard ([lfx-architecture-decisions/0002](https://github.com/linuxfoundation/lfx-architecture-decisions/blob/main/decisions/0002-structured-json-logging.md)): `error` for non-recoverable failures, `warn` for recoverable/client errors, `info` for successful mutating requests only. Because v1 is a read-only API, read endpoints must not emit info logs. pino's OTel mixin injects `trace_id` and `span_id` into every line so logs correlate to traces in Datadog automatically — `trace_id` is the canonical correlation key; no parallel `requestId` field is used for log correlation.

### OpenTelemetry instrumentation; trace ID is the request ID — [docs/adr/0019](../adr/0019-opentelemetry-instrumentation.md)

The API uses `@opentelemetry/sdk-node` with HTTP, Postgres, and pino auto-instrumentation. W3C TraceContext propagation is automatic — inbound `traceparent` headers are honoured, outbound HTTP calls inject them, and the active trace context flows through async operations without manual plumbing. Inheriting [LFX-0003](https://github.com/linuxfoundation/lfx-architecture-decisions/blob/main/decisions/0003-opentelemetry-instrumentation.md). W3C `traceparent` is the sole HTTP propagation channel — no `X-Request-Id` response header is set. The OTel trace ID **is** the request ID: it surfaces in the error envelope's `requestId` field, so a support ticket carrying a `requestId` joins logs ↔ APM traces in Datadog without translation. There is no parallel ULID generator. Logs include `trace_id`/`span_id` (OTel hex format); Datadog's APM ingester recognises OTel-format IDs natively — no parallel `dd.trace_id`/`dd.span_id` fields are emitted. Sampling is 100% in v1 — revisit when RPS data is available. The SDK exports OTLP to a co-located `opentelemetry-collector` sidecar (`localhost:4317`), which forwards to Datadog in prod/staging — following LFX-0003's recommendation and keeping the configuration self-contained in the pod with no changes to the shared cluster Datadog agent.
