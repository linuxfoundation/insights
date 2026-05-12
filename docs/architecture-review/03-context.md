# Domain Context

This page defines the canonical language for the LFX Insights Public API. When writing tasks, docs, or code comments, use these terms precisely. Ambiguities from earlier design discussions are recorded in the **Flagged ambiguities** section.

The full machine-readable version lives at [`docs/CONTEXT.md`](../CONTEXT.md).

---

## Auth & Identity

**API Key**
The long-lived credential a User receives from the LFX Self-Serve App at `app.lfx.dev/settings` — technically a Refresh Token. Customers see and handle this as their "API key." Only Key Contacts in member organizations are permitted to create them. The actual Bearer value sent to the Insights API is a short-lived Access Token derived from it.
_Avoid:_ token, secret, access key

**Refresh Token**
The long-lived credential held by the customer (what they receive as their "API key"). Used at `POST api.insights.linuxfoundation.org/v1/auth/token` (proxied to LFX Self-Serve) to mint Access Tokens. Never sent to the Insights API as a Bearer credential. Revoking it stops future Access Token mints; in-flight Access Tokens continue to work until their `exp`. Multiple active Refresh Tokens per User are supported for zero-downtime rotation.
_Avoid:_ long-lived JWT, API key (when referring to the credential type specifically)

**Access Token**
A short-lived JWT (~15 min) minted from the Refresh Token. Sent to the Insights API as `Authorization: Bearer <access_token>`. Carries the verified `sub`, `org`, `tier`, `iss`, `kid`, and possibly `aud` claims. JWKS-verified on every request.
_Note:_ the presence of `org` and `tier` in the LFX Self-Serve access token is an assumption pending confirmation with the Self-Serve team (T-015). If the existing PAT is reused, these claims may need to be added.
_Avoid:_ calling it just "a JWT" or "the bearer token" — always use "access token" so it's clear which credential is meant

**User**
The human account that owns one or more API Keys (Refresh Tokens) and is the billing principal. Identified by the JWT `sub` claim issued by the LFX Self-Serve App.
_Avoid:_ account, customer, client

**Organization** (`org_id`)
The LFX organization tied to a User's API access, encoded in the `org` claim of the LFX Self-Serve access token. "Belongs to" is narrow here: only authorized **Key Contacts** of an organization with an active LFX membership can hold API keys — not every employee or self-attested affiliate of the organization. Used as the shared bucket for rate-limit quotas — all API keys belonging to Key Contacts in the same org draw from one pool.
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
Any modification that forces existing callers to update their integration: removing or renaming a response field, changing a field's type, making an optional input required, removing an endpoint, or changing the Error Envelope shape. Governed by the tolerant-reader contract (ADR-0003). Changing default or max pageSize, changing the cursor encoding semantics, removing a value from an endpoint's `sort` allow-list, or changing an endpoint's default `sort` value also counts.
_Avoid:_ non-backwards-compatible change

**Error Envelope**
The standard JSON shape for all error responses:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded your rate limit.",
    "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "docsUrl": "https://docs.../errors#rate_limit_exceeded"
  }
}
```
`code` is a machine-readable snake_case string. `docsUrl` deep-links to the relevant docs page.
_Avoid:_ error body, error payload

**Request ID**
The OpenTelemetry trace ID for the request — a 32-char lowercase hex string (128-bit). Exposed in the error envelope's `requestId` field; this is the value a customer quotes in a support ticket. The same value appears in pino log lines as `trace_id` and on the active OTel span, so logs ↔ APM traces join in Datadog without translation. W3C `traceparent` is the sole HTTP propagation channel — honoured inbound, injected outbound; no `X-Request-Id` response header is set. There is no separate ULID/UUID request ID — see ADR-0019.
_Avoid:_ ULID, UUID, separate correlation ID, X-Request-Id

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
| Pagination | cursor-based: `cursor` (opaque base64url) + `pageSize` (default 50, max 200) + `sort` from a per-endpoint allow-list (e.g. `name_asc`, `commits_desc`); response: `{ data, pageSize, nextCursor }`; `nextCursor: null` ⇒ end; removing an allowed `sort` value or changing its default is a breaking change |
| Error codes | snake_case machine-readable strings (`tier_forbidden`, `rate_limit_exceeded`, `unauthorized`) |

---

## Relationships

```
User  ──owns──▶  API Key  (many keys per user)
User  ──is Key Contact of──▶  Organization  (one org per user, v1)
Organization  ──has──▶  Tier
Organization  ──has──▶  Rate-limit Pool
Endpoint Group  ──contains──▶  many Endpoints
Endpoint  ──transitions through──▶  /v1-alpha → /v1
Collection  ──owned by──▶  User  (creator only, via `ssoUserId`; null for curated/system Collections)
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
