# LFX Insights Public API

A server-to-server HTTP API that exposes LFX Insights analytics data (contributor activity, project health, security posture) to external developers. It is a standalone service (`/api`) backed by the same Tinybird workspace and Postgres database as the existing Nuxt frontend, but with a formal versioned contract, API key authentication, and rate limiting.

## Language

### Auth & Identity

**API Key**:
The long-lived credential a User receives from the LFX Self-Serve App at `app.lfx.dev/settings` — technically a Refresh Token. Customers see and handle this as their "API key." Only Key Contacts in member organizations are permitted to create them. The actual Bearer value sent to the Insights API on each request is a short-lived Access Token derived from it.
_Avoid_: token, secret, access key

**Refresh Token**:
The long-lived credential held by the customer (what they receive as their "API key"). Used at `POST api.insights.linuxfoundation.org/v1/auth/token` (which Insights proxies to LFX Self-Serve) to mint Access Tokens. Never sent to the Insights API as a Bearer credential. Revoking it stops the customer's code from minting new Access Tokens; in-flight Access Tokens continue to work until their `exp`. Multiple active Refresh Tokens per User are supported for zero-downtime rotation.
_Avoid_: long-lived JWT, API key (when referring to the credential type specifically)

**Access Token**:
A short-lived JWT (~15 min) minted from the Refresh Token via the proxied `/v1/auth/token` endpoint. Sent to the Insights API as `Authorization: Bearer <access_token>`. Carries the verified `sub`, `org`, `tier`, `iss`, `kid`, and possibly `aud` claims. JWKS-verified on every request. Customers typically don't handle these directly — a short `getAccessToken()` helper or SDK manages the lifecycle.
_Avoid_: calling it just "a JWT" or "the bearer token" — always use "access token" so it's clear which credential is meant

**User**:
The human account that owns one or more API Keys (Refresh Tokens) and is the billing principal. Identified by the JWT `sub` claim issued by the LFX Self-Serve App.
_Avoid_: account, customer, client

**Organization (org_id)**:
The LFX organization tied to a User's API access, encoded in the `org` claim of the LFX Self-Serve access token. "Belongs to" is narrow here: only authorized **Key Contacts** of an organization with an active LFX membership can hold API keys — not every employee or self-attested affiliate of the organization. Used as the shared bucket for rate-limit quotas — all keys belonging to Key Contacts in the same org share a pool.
_Avoid_: tenant, workspace, team

**Tier**:
A named LFX membership level attached to an Organization that controls the rate-limit pool size. Known tiers in ascending order: Silver, Gold, Platinum (exact hierarchy and rate-limit numbers confirmed at T-093). In v1, tiers affect only rate limits; endpoint-level gating is reserved for future versions.
_Avoid_: plan, subscription

### API Shape

**Endpoint Group**:
A logical cluster of related endpoints released together as a unit (Development, Contributors, Popularity, Security, Collections). Each group maps to a Jira epic.
_Avoid_: phase, module, domain

**Breaking Change**:
Any modification that forces existing callers to update their integration: removing or renaming a response field, changing a field's type, making an optional input required, removing an endpoint, or changing the error envelope shape. Governed by the tolerant-reader contract (see ADR-0003). Changing default or max pageSize, changing the cursor encoding semantics, removing a value from an endpoint's `sort` allow-list, or changing an endpoint's default `sort` value also counts.
_Avoid_: non-backwards-compatible change

**Error Envelope**:
The standard JSON wrapper for all error responses: `{ error: { code, message, requestId, docsUrl } }`. `code` is a machine-readable snake_case string; `docsUrl` is always present — it deep-links to a specific docs page when one exists, otherwise to the general errors reference page.
_Avoid_: error body, error payload

**Request ID**:
The OpenTelemetry trace ID for the request — a 32-char lowercase hex string (128-bit). Exposed in the error envelope's `requestId` field; this is the value a customer quotes in a support ticket. The same value appears in pino log lines as `trace_id` and on the active OTel span, so logs ↔ APM traces join in Datadog without translation. W3C `traceparent` is the sole HTTP propagation channel — honoured inbound, injected outbound; no `X-Request-Id` response header is set. There is no separate ULID/UUID request ID — see ADR-0019.
_Avoid_: ULID, UUID, separate correlation ID, X-Request-Id

### Data & Infrastructure

**Tinybird**:
The columnar analytics database backing all time-series metrics (contributor activity, commit counts, etc.). The API queries Tinybird Pipes via HTTP; it does not use Postgres for analytics reads.
_Avoid_: analytics DB, ClickHouse (Tinybird is the canonical name in this repo)

**Collection**:
A named group of projects and repositories stored in Postgres (`collections` table, keyed by `slug`). Two types: **Community Collections** (created by a User, owned via `ssoUserId`) and **Curated Collections** (system-created, `ssoUserId` is null). Privacy is a boolean `isPrivate` flag — public collections are visible to any valid API key; private collections are visible only to their owner. There is no collaborator or member model — ownership is exclusively the creator.
_Avoid_: project group, saved filter, list

**Rate-limit Pool**:
The shared sliding-window counter for an Organization. All API Keys belonging to users in the same org draw from the same pool. Implemented in Redis.
_Avoid_: quota, bucket

### API Stability

**`/v1-alpha`**:
The unstable stage. Endpoints are served under `/v1-alpha/...` — no contract guarantees. Breaking changes (field renames, shape changes, endpoint removal) are allowed freely. Used during early validation with a small allow-listed cohort.
_Avoid_: beta, preview

**`/v1`**:
The stable stage. Endpoints graduate here from `/v1-alpha` once they pass the promotion criteria (load test, one week of stable shape, error/latency budgets, security sign-off). From this point the full tolerant-reader contract applies: additive-only changes within `/v1`; any breaking change requires `/v2`.
_Avoid_: stable, released, GA

## Relationships

- A **User** holds one or more **API Keys**
- A **User** is an authorized **Key Contact** of one **Organization** (v1); the **Organization** owns the **Rate-limit Pool**
- A **Tier** is attached to an **Organization** and governs the size of its **Rate-limit Pool**
- A **Collection** is owned by a single **User** (the creator, identified by `ssoUserId`); curated/system Collections have `ssoUserId = null`. There is no collaborator or org-ownership model in v1. A **Permission Check** gates access per request for private Collections (see ADR-0007)
- An **Endpoint Group** contains many endpoints; endpoints are promoted through launch stages independently

## Example dialogue

> **Dev:** "Should I check the User's tier before returning a response?"
> **Domain expert:** "In v1, no — all tiers see all endpoints. Tier only affects the Rate-limit Pool size. If the org's pool is exhausted you return 429; if a future endpoint requires a higher tier you return 403 `tier_forbidden`. Don't conflate the two."

## Conventions

These are committed wire-format decisions — changing them within v1 would be a breaking change (see ADR-0003).

- **JSON key casing:** camelCase for all request and response fields (`startDate`, `activityTypes`). The Nuxt layer uses mixed casing; the `nuxt-to-api` skill normalizes to camelCase at port time.
- **Date format:** ISO-8601 UTC strings only (`2025-12-31T23:59:59Z`). Never Unix timestamps or locale-formatted strings.
- **Pagination:** cursor-based. Request: `cursor` (opaque, omit on first page) + `pageSize` (default 50, max 200) + `sort` from a per-endpoint allow-list (e.g. `name_asc`, `commits_desc`). Response: `{ data, pageSize, nextCursor }` — `nextCursor: null` means end of list. No `total` field. Removing an allowed `sort` value or changing an endpoint's default sort is a breaking change. See [ADR-0011](adr/0011-pagination-cursor-based.md).
- **Error codes:** machine-readable snake_case strings in the Error Envelope `code` field (e.g. `tier_forbidden`, `rate_limit_exceeded`, `unauthorized`, `upstream_unavailable`).
- **Cache TTLs:** two tiers — long cache (24h) for stable data (project lists, leaderboards, categories); short cache (1h) for time-series analytics. Mirrors the existing Nuxt API caching model.
- **Tinybird error handling:** when Tinybird is unavailable, the cached Redis response is served if one exists within its normal TTL. If the cache is empty or expired, 503 with `code: upstream_unavailable` is returned.

## Flagged ambiguities

- "account" was used for both User and Organization during design — resolved: **User** is the human principal (identified by `sub`), **Organization** is the entity that holds an LFX membership (Silver/Gold/Platinum) and owns the Rate-limit Pool (identified by `org_id`).
- "phase" was used interchangeably with Endpoint Group — resolved: use **Endpoint Group** for the technical rollout cluster; "phase" is informal and should be avoided in task descriptions.
