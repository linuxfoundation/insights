# v1 contract: tolerant-reader / additive-only changes within a version

## Stability prefixes

Endpoints go through two URL-level stability stages before they are considered stable:

- **`/v1-alpha/...`** — no contract guarantees. Used during the closed-alpha stage. We can change shapes, rename fields, remove endpoints, or restructure responses freely. Alpha callers are explicitly told to expect breakage and must re-integrate when we promote to `/v1`.
- **`/v1/...`** — full tolerant-reader contract (see below). An endpoint graduates to `/v1` when it is promoted to silent public. From that point, the additive-only rules apply and breaking changes require a version bump.

This means closed-alpha users integrate against `/v1-alpha` and absorb any churn during validation. Once an endpoint moves to `/v1`, the contract is locked and all callers — including MCP integrations — can rely on it indefinitely.

## `/v1` contract

Within `/v1`, we commit to additive-only changes: new response fields, new optional query params, new endpoints, expanded enum inputs, new error codes. In practice this means the version number rarely if ever changes — the vast majority of API evolution is additive and stays on v1 indefinitely. A version bump is only warranted when something fundamental needs to be removed or restructured, which for a read-only analytics API is rare; Stripe has followed this same model and remained on v1 since 2011. Callers are documented to ignore unknown response fields. Any removal, rename, type change, or constraint-tightening requires a new major version prefix. We chose this over date-based versioning (e.g. `2025-01-01`) because the primary consumers are MCP integrations and automated tooling — a stable, predictable URL like `/v1/...` is simpler to hardcode and reason about than a date-versioned header scheme where the caller must track which date snapshot they're pinned to. Engineers adding a field to a response type must not remove another field in the same PR without a `/v2` plan in place.

## Promotion from `/v1-alpha` to `/v1`

An endpoint can be promoted when all of the following are true:

1. **Load test passes** — baseline req/s established, rate limiter validated under load ([T-090](../PUBLIC_API_PLAN.md#epic-e16--pre-launch)).
2. **No contract regressions** — the closed-alpha cohort has been using it without shape changes for at least one week.
3. **Error and latency budgets healthy** — 5xx rate and p99 latency within acceptable thresholds in Datadog.
4. **Security sign-off** — no open auth, tenant isolation, or key-leakage issues for this endpoint.

**Promotion mechanics:**

1. Open a PR that adds the handler under `/v1/...` (the contract-locked route).
2. Change the `/v1-alpha/...` handler to return `410 Gone` with a `Link: </v1/...>; rel="successor-version"` header, so alpha callers get a clear machine-readable signal to update their URLs.
3. Notify the closed-alpha cohort directly (release notes) with the new `/v1` URL and a migration note.
4. Both routes coexist for a minimum of 2 weeks after promotion to give alpha callers time to migrate, then the `410` handler can be removed entirely.

## Deprecation process

When a field, parameter, or endpoint needs to be removed, the process is:

1. **Mark it deprecated** in the TypeBox schema using a `description` annotation starting with `DEPRECATED:` and a short reason. The OpenAPI spec will surface this to consumers.
2. **Add response headers** on the affected endpoint: `Deprecation: true` and `Sunset: <ISO-8601 date>` (the earliest date we will remove it), plus `Link: <migration-guide-url>; rel="deprecation"` pointing to the migration guide.
3. **Communicate** — add an entry to the changelog page in docs and, where possible, notify known consumers directly.
4. **Honour the sunset window** — the field or endpoint must remain functional until the `Sunset` date. Removal before that date is a contract violation.
5. **Remove in the next major version** — the actual removal ships in `/v2`, not `/v1`. The `/v1` endpoint or field stays alive (even if just returning empty/stub data) until v1 is fully sunset.

For **fields**: keep the field in the response but document it as deprecated. Do not change its type or meaning — that is also a breaking change.

For **endpoints**: keep the route returning valid responses. Return a `Deprecation` header on every response from that route.

For **entire versions**: sunset `/v1` only after `/v2` has been stable for a publicly announced minimum period (TBD — at least 6 months is conventional).

## Consequences

- All TypeBox response schemas must be treated as append-only within v1
- The `nuxt-to-api` conversion skill must normalize field names to camelCase at port time (not patch them in-place later, which would be a breaking rename)
