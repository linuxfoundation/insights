# Domain Context

This page defines the canonical language for the LFX Insights Public API. When writing tasks, docs, or code comments, use these terms precisely. Ambiguities from earlier design discussions are recorded in the **Flagged ambiguities** section.

The full machine-readable version lives in `CONTEXT.md` at the repo root.

---

## Auth & Identity

**API Key**
A long-lived credential issued to a User that authenticates every request. Carried as a Bearer token in the `Authorization` header. Maps to exactly one User; multiple active keys per User are supported for zero-downtime rotation.
_Avoid:_ token, secret, access key

**User**
The human account that owns an API Key and is the billing principal. Identified by the Auth0 `sub` claim inside the JWT.
_Avoid:_ account, customer, client

**Organization** (`org_id`)
The LFX organization a User belongs to, extracted from the JWT. Used as the shared bucket for rate-limit quotas — all API keys belonging to users in the same org draw from one pool.
_Avoid:_ tenant, workspace, team

**Tier**
A named access level attached to an Organization that controls Rate-limit Pool size. In v1, tiers affect only rate limits; endpoint-level gating is reserved for future versions.
_Avoid:_ plan, subscription

---

## API Shape

**Endpoint Group**
A logical cluster of related endpoints released together (Development, Contributors, Popularity, Security, Collections). Each group maps to a Jira epic. Endpoints within a group are promoted through launch stages independently.
_Avoid:_ phase, module, domain

**Breaking Change**
Any modification that forces existing callers to update their integration: removing or renaming a response field, changing a field's type, making an optional input required, removing an endpoint, or changing the Error Envelope shape. Governed by the tolerant-reader contract (ADR-0003). Changing default pagination values also counts.
_Avoid:_ non-backwards-compatible change

**Error Envelope**
The standard JSON shape for all error responses:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded your rate limit.",
    "requestId": "01HZ...",
    "docs_url": "https://docs.../errors#rate_limit_exceeded"
  }
}
```
`code` is a machine-readable snake_case string. `docs_url` deep-links to the relevant docs page.
_Avoid:_ error body, error payload

**Request ID**
A ULID generated per-request, propagated as the `X-Request-Id` response header and attached to all log lines and OTel spans. Used by support for tracing a specific request across systems.
_Avoid:_ trace ID, correlation ID

---

## Data & Infrastructure

**Tinybird**
The columnar analytics database backing all time-series metrics (contributor activity, commit counts, etc.). The API queries Tinybird Pipes via HTTP; it does not use Postgres for analytics reads.
_Avoid:_ analytics DB, ClickHouse (Tinybird is the canonical name in this repo)

**Collection**
A user-curated named group of projects, stored in Postgres. The only Endpoint Group (Phase 5) that requires a per-request permission check — callers must prove they have access to the specific Collection they are querying.
_Avoid:_ project group, saved filter, list

**Rate-limit Pool**
The shared sliding-window counter for an Organization. All API keys belonging to users in the same org draw from the same pool. Implemented as a Redis key keyed by `org_id`.
_Avoid:_ quota, bucket

---

## API Stability

**`/v1-alpha`**
The unstable stage. Endpoints served under `/v1-alpha/...` carry no contract guarantees — breaking changes (field renames, shape changes, endpoint removal) are allowed freely. Access is restricted to an allow-listed cohort (LFX-internal + external design partners) for contract and performance validation.
_Avoid:_ beta, preview

**`/v1`**
The stable stage. An endpoint graduates here once it passes the promotion criteria: load test passes, shape has been stable for at least one week with the alpha cohort, error/latency budgets are healthy, and security sign-off is given. From this point the full tolerant-reader contract applies — only additive changes within `/v1`; breaking changes require `/v2`. The `/v1-alpha` route returns `410 Gone` for two weeks after promotion.
_Avoid:_ stable, released, GA

---

## Wire-Format Conventions

These are committed in v1. Changing any of them within v1 is a Breaking Change.

| Convention | Rule |
|---|---|
| JSON key casing | camelCase for all request and response fields (`startDate`, `activityTypes`) |
| Date format | ISO-8601 UTC strings only (`2025-12-31T23:59:59Z`) — never Unix timestamps |
| Pagination | `page` + `pageSize`, zero-indexed (`page=0` = first page); response: `{ data, page, pageSize, total }` |
| Error codes | snake_case machine-readable strings (`tier_forbidden`, `rate_limit_exceeded`, `unauthorized`) |

---

## Relationships

```
User  ──owns──▶  API Key  (many keys per user)
User  ──belongs to──▶  Organization  (one org per user, v1)
Organization  ──has──▶  Tier
Organization  ──has──▶  Rate-limit Pool
Endpoint Group  ──contains──▶  many Endpoints
Endpoint  ──transitions through──▶  /v1-alpha → /v1
Collection  ──owned by──▶  User / Organization
Collection endpoint  ──requires──▶  Permission Check  (Postgres + Redis cache)
```

---

## Example Dialogue

> **Dev:** "Should I look up the User's tier before returning a response?"
>
> **Domain expert:** "In v1, no — all tiers see all endpoints. Tier only affects the Rate-limit Pool size. If the org's pool is exhausted, return 429. If a *future* endpoint is gated above the caller's tier, return 403 `tier_forbidden`. Don't conflate the two."

---

## Flagged Ambiguities

| Term used | Ambiguity | Resolution |
|---|---|---|
| "account" | Used for both User and Organization during design | **User** = human principal (`sub`); **Organization** = the entity that holds an LFX membership (Silver/Gold/Platinum) and owns the Rate-limit Pool (`org_id`) |
| "GA" / "stable" / "released" | Used loosely to mean "live" | Use **`/v1`** — an endpoint is either on `/v1-alpha` (no contract) or `/v1` (full contract). Avoid GA/stable/released. |
| "phase" | Used interchangeably with Endpoint Group | Use **Endpoint Group** in task descriptions; "phase" is informal and imprecise |
| "customer" | Used for both the User and their Organization | Use **User** for the human principal; use **Organization** for the LFX membership holder |
