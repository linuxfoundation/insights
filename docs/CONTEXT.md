# LFX Insights Public API

A server-to-server HTTP API that exposes LFX Insights analytics data (contributor activity, project health, security posture) to external developers. It is a standalone service (`/api`) backed by the same Tinybird workspace and Postgres database as the existing Nuxt frontend, but with a formal versioned contract, API key authentication, and rate limiting.

## Language

### Auth & Identity

**API Key**:
A long-lived credential issued to a User that authenticates every request. Carried as a Bearer token. Maps to exactly one User; multiple active keys per User are allowed for zero-downtime rotation. Keys are created by the User inside LFX Insights — only users whose Organization holds an active LFX membership are permitted to create keys.
_Avoid_: token, secret, access key

**User**:
The human account that owns an API Key and is the billing principal. Identified by the Auth0 `sub` claim inside the JWT.
_Avoid_: account, customer, client

**Organization (org_id)**:
The LFX organization a User belongs to, extracted from the JWT. Used as the shared bucket for rate-limit quotas — all keys belonging to users in the same org share a pool.
_Avoid_: tenant, workspace, team

**Tier**:
A named LFX membership level attached to an Organization that controls the rate-limit pool size. Known tiers in ascending order: Silver, Gold, Platinum (exact hierarchy and rate-limit numbers confirmed at T-093). In v1, tiers affect only rate limits; endpoint-level gating is reserved for future versions.
_Avoid_: plan, subscription

### API Shape

**Endpoint Group**:
A logical cluster of related endpoints released together as a unit (Development, Contributors, Popularity, Security, Collections). Each group maps to a Jira epic.
_Avoid_: phase, module, domain

**Breaking Change**:
Any modification that forces existing callers to update their integration: removing or renaming a response field, changing a field's type, making an optional input required, removing an endpoint, or changing the error envelope shape. Governed by the tolerant-reader contract (see ADR-0003).
_Avoid_: non-backwards-compatible change

**Error Envelope**:
The standard JSON wrapper for all error responses: `{ error: { code, message, requestId, docsUrl } }`. `code` is a machine-readable snake_case string; `docsUrl` is always present — it deep-links to a specific docs page when one exists, otherwise to the general errors reference page.
_Avoid_: error body, error payload

**Request ID**:
A ULID generated per-request, propagated as `X-Request-Id` response header and attached to all log lines and OTel spans. Used by support for tracing a specific request.
_Avoid_: trace ID, correlation ID

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
- A **User** belongs to one **Organization**; the **Organization** owns the **Rate-limit Pool**
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
- **Pagination:** `page` + `pageSize` query params, zero-indexed (`page=0` is the first page). Response: `{ data, page, pageSize, total }`.
- **Error codes:** machine-readable snake_case strings in the Error Envelope `code` field (e.g. `tier_forbidden`, `rate_limit_exceeded`, `unauthorized`, `upstream_unavailable`).
- **Cache TTLs:** two tiers — long cache (24h) for stable data (project lists, leaderboards, categories); short cache (1h) for time-series analytics. Mirrors the existing Nuxt API caching model.
- **Tinybird error handling:** when Tinybird is unavailable, the cached Redis response is served if one exists within its normal TTL. If the cache is empty or expired, 503 with `code: upstream_unavailable` is returned.

## Flagged ambiguities

- "account" was used for both User and Organization during design — resolved: **User** is the human principal (identified by `sub`), **Organization** is the entity that holds an LFX membership (Silver/Gold/Platinum) and owns the Rate-limit Pool (identified by `org_id`).
- "phase" was used interchangeably with Endpoint Group — resolved: use **Endpoint Group** for the technical rollout cluster; "phase" is informal and should be avoided in task descriptions.
