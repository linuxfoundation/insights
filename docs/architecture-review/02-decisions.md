# Architecture Decisions

All decisions recorded here met the ADR bar: hard to reverse, surprising without context, result of a genuine trade-off. Full ADR files live in [`docs/adr/`](../adr/).

---

## Service & Infrastructure

### Where the service lives — [docs/adr/0002](../adr/0002-api-at-repo-root.md)

The API is a top-level directory `/api` at the repo root, sibling to `frontend/`, not inside `workers/`. The `workers/` tree is for background workers; `/api` is a long-running HTTP server with its own deployment unit, matching the `frontend/` precedent. Keeping it at the root makes `pnpm-workspace.yaml` membership and CI matrix entries symmetric.

### Framework: Fastify over NestJS — [docs/adr/0001](../adr/0001-fastify-over-nestjs.md)

We chose Fastify over NestJS (the leading alternative) because: NestJS adds 3–5× boilerplate for a read-only proxy service; it couples schema validation to class-validator, where we want TypeBox; and Fastify's `genReqId` hook is a first-class primitive for Request ID propagation. Express was rejected for lack of built-in validation and lower throughput. Hono was rejected because it is designed for edge runtimes (Cloudflare Workers, Deno Deploy) first and Node second — the Tinybird and Postgres clients rely on Node-native APIs (`net`, `tls`, `Buffer`) that edge runtimes don't provide, so running Hono on Node requires an adapter layer that reintroduces the compatibility risk Hono was chosen to avoid. Fastify is Node-native and battle-tested at scale with no runtime adapter between the framework and the OS.

### OpenAPI: TypeBox code-first — [docs/adr/0008](../adr/0008-typebox-code-first-openapi.md)

TypeBox is a TypeScript library where a single object definition is simultaneously a valid JSON Schema (used at runtime) and a TypeScript type (used at compile time). A route schema like `Type.Object({ commitCount: Type.Number() })` both validates the incoming request at runtime and produces the TypeScript type `{ commitCount: number }` statically — no duplication and drift.

Fastify has first-class support for this pairing via `@fastify/type-provider-typebox`: it consumes TypeBox schemas directly for request validation and response serialization, and `@fastify/swagger` reads the same schemas to generate the OpenAPI spec automatically. The result is that the spec literally cannot diverge from the implementation — they are derived from the same object.

Zod was considered as an alternative (more ergonomic API, larger community) but rejected because Zod's native type is not JSON Schema — a conversion layer (`zod-to-json-schema`) is required, which reintroduces a transformation step that can drift. The Fastify+TypeBox integration is zero-transformation: the schema object _is_ the JSON Schema.

Hand-written OpenAPI YAML was rejected outright: with ~100 endpoints, drift between the YAML spec and the actual handler behavior is high maintenance. TypeBox is the single validation and schema boundary.

### API docs: VitePress + Scalar at `api.insights.linuxfoundation.org/docs` — [docs/adr/0016](../adr/0016-vitepress-scalar-api-docs.md)

API docs live in `api/docs/` as a standalone VitePress site, served by Fastify under `/docs`. Scalar is embedded on the reference page and reads the generated OpenAPI spec — the reference cannot drift. Mintlify was rejected (paid, external infra). Extending `frontend/docs/` was rejected — API docs have their own release cadence and should not be coupled to the frontend deploy.

---

## Authentication & Authorization

### Every request requires a valid API key — [docs/adr/0009](../adr/0009-api-key-required-for-all-requests.md)

All endpoints, including those serving public project data, require a valid API key. There is no unauthenticated path. A missing or invalid key returns 401 immediately. This is intentional: rate limiting requires a stable identity, and attribution data is essential for roadmap prioritization. 

### API keys stored in Auth0 — [docs/adr/0015](../adr/0015-api-keys-stored-in-auth0.md)

API keys are issued and persisted as Auth0 credentials, managed via the Auth0 Management API. JWT signing and JWKS verification are handled by Auth0, consistent with the existing auth infrastructure. Storing keys in our own Postgres was rejected — it would require owning the signing key, the revocation surface, and the token lifecycle.

### Tiers control rate limits only in v1 — [docs/adr/0005](../adr/0005-tiers-control-rate-limits-only.md)

All tiers see all endpoints in v1 (which are existing endpoints that power the widgets in Insights). The Tier attached to an Organization only determines the size of its Rate-limit Pool. The per-route "required tier" mechanism is built into the framework (future gating is a config change, not an architecture change), but every v1 endpoint declares the minimum tier. Engineers must not add per-endpoint tier checks without a product decision — doing so breaks callers who integrated assuming open access.

### API keys are long-lived, no auto-expiry — [docs/adr/0006](../adr/0006-long-lived-api-keys.md)

Keys do not expire automatically. Multiple active keys per user are supported for zero-downtime rotation (mint new → switch → revoke old). Revocation is enforced by deleting the key from Auth0 — the next request using it fails JWKS verification instantly. No deny-list needed.

Refresh tokens and expiring tokens can be introduced in v2 — long-lived keys are a simplicity decision for v1.

### Collections-only permission check — [docs/adr/0007](../adr/0007-collections-only-permission-check.md)

Endpoint Groups 1–4 (Development, Contributors, Popularity, Security, Overview) expose aggregated public data — a valid API key is sufficient. Only Group 5 (Collections) requires a per-request ownership check (Postgres lookup, Redis-cached at 60s TTL) because Collections are user-created private groupings. Engineers must not add ownership checks to Groups 1–4.

### Collections Postgres queries written fresh in `/api` — [docs/adr/0017](../adr/0017-collections-queries-not-shared.md)

The `/api` service writes its own minimal read-only Postgres queries for Collections rather than extracting a shared repo library. The frontend repo is write-heavy and Nuxt-coupled; the API only needs ~3 read queries. Engineers seeing what looks like duplicated SQL should not reflexively extract a shared repo — the duplication is deliberate.

---

## API Contract

### Tolerant-reader / additive-only versioning — [docs/adr/0003](../adr/0003-tolerant-reader-versioning.md)

Endpoints go through two URL-level stability stages. During closed alpha they are served under `/v1-alpha/...` — no contract guarantees, shapes can change freely. When an endpoint graduates to silent public it moves to `/v1/...` and the full contract locks in: only additive changes are permitted (new response fields, new optional query params, new endpoints, expanded enum inputs, new error codes). Any removal, rename, type change, or constraint-tightening from that point requires a new major version prefix (`/v2`). Customers commit to ignoring unknown fields (documented prominently).

**Promotion from `/v1-alpha` to `/v1`** happens when: load test passes, the closed-alpha cohort has used the endpoint without shape changes for at least one week, error/latency budgets are healthy, and security sign-off is given. Mechanically: the `/v1` route is added in a PR, the `/v1-alpha` route is changed to return `410 Gone` with a `Link: </v1/...>; rel="successor-version"` header, the alpha cohort is notified directly, and both routes coexist for a minimum of 2 weeks before the `410` handler is removed.

When a field, parameter, or endpoint needs to eventually be removed, the deprecation process is: (1) annotate it as `DEPRECATED:` in the TypeBox schema so it surfaces in the OpenAPI spec; (2) add `Deprecation: true`, `Sunset: <date>`, and `Link: <migration-guide>; rel="deprecation"` response headers on every response from that route; (3) publish a changelog entry and notify known consumers; (4) honour the sunset window — removal before the `Sunset` date is a contract violation; (5) do the actual removal in `/v2`, not `/v1`. Full details in [docs/adr/0003](../adr/0003-tolerant-reader-versioning.md).

### Pagination: `page` + `pageSize`, zero-indexed — [docs/adr/0011](../adr/0011-pagination-page-pagesize-zero-indexed.md)

All paginated endpoints use `page` (zero-indexed) + `pageSize` query params, returning `{ data, page, pageSize, total }`. The existing Nuxt codebase already uses this convention as the dominant pattern — preserving it avoids off-by-one translation bugs during the port. A handful of Nuxt endpoints use `limit`/`offset` instead; those are normalized to `page`/`pageSize` at port time so the public API stays consistent. External developers used to 1-based pagination will need to start at `page=0` — this is called out prominently in the docs quickstart.

### camelCase JSON + ISO-8601 UTC dates — [docs/adr/0014](../adr/0014-camelcase-json-iso8601-dates.md)

All JSON keys are camelCase (`startDate`, `activityTypes`). Dates are ISO-8601 UTC strings (`2025-12-31T23:59:59Z`), never Unix timestamps. The existing Nuxt layer is mixed (some snake_case fields mirror Tinybird's internal naming); the `nuxt-to-api` skill normalizes at port time. Coupling the public contract to Tinybird field names was rejected because it would make Tinybird schema changes into API breaking changes.

### URL porting: hybrid, rename only when genuinely misleading — [docs/adr/0012](../adr/0012-url-port-strategy-hybrid.md)

The default is to port-as-is from Nuxt to `/v1/...` with light normalization (kebab-case, plural nouns). Renaming happens only when the existing URL is genuinely misleading to an external developer. Any rename must be recorded in the PR. Wholesale renaming was rejected as a large diff with no functional change, obscuring the real porting work.

### v1 is server-to-server only; CORS denies all browser origins — [docs/adr/0004](../adr/0004-server-to-server-cors-deny.md)

`Access-Control-Allow-Origin` is absent for the API — this is intentional. Allowing browser origins in v1 would require a CORS policy, credential-safe key distribution, and potentially cookie-based auth — all out of scope. **Flagged for revisit before launch** Will we need browser-side access? 

---

## Operations & Cost

### Caching: origin Redis only, `Cache-Control: private` — [docs/adr/0013](../adr/0013-origin-cache-only-private-cache-control.md)

All responses carry `Cache-Control: private, max-age=0`. A Redis cache with two TTL tiers lives at the origin: 24h for stable data (project lists, leaderboards, categories), 1h for time-series analytics. Clients and CDNs do not cache. This keeps a single TTL knob we can tune without a contract change, and avoids accidental public caching of org-scoped Collection responses.

### Billing bundled with LFX membership — [docs/adr/0010](../adr/0010-billing-bundled-with-lfx-membership.md)

API access is included in the user's existing LFX membership tier. No separate billing infrastructure or usage-based pricing in v1.

### Datadog: hybrid custom metrics + APM trace metrics — [PUBLIC_API_PLAN.md §3 D5 + §6](../PUBLIC_API_PLAN.md#d5-datadog-metrics-strategy--custom-metrics-vs-apm-trace-metrics)

Low-cardinality custom metrics (tags: `endpoint`, `version`, `tier`, `status_class(2xx,4xx,5xx)`) power SRE dashboards and alerting. High-cardinality dimensions (`customer_id`, `api_key_id`) live in APM span attributes — not billed as custom metrics. Estimated budget: ~5,400 timeseries at ~$270/mo above DD quota. Pure custom metrics were rejected because per-customer cardinality would blow the cost budget.
