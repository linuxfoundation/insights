# ADR-0023: Every caller gets a flat 30 requests per second, keyed by LFID

**Date**: 2026-10-19
**Status**: accepted
**Deciders**: API team

## Context

[ADR-0005](./0005-tiers-control-rate-limits-only.md) has the membership tier set the size of an organization's rate-limit pool, and [ADR-0006](./0006-pat-token-exchange-for-api-credentials.md) keys that pool by the organization the Worker resolves. A per-tier matrix needs rate-limit numbers that product has not signed off, plus a mapping from the member-service tier classes to public tiers, and neither exists yet. Callers without an organization, which [ADR-0010](./0010-billing-bundled-with-lfx-membership.md) now forwards, still need a key and a pool. The limiter should not wait for those decisions.

## Decision

We will limit every caller to 30 requests per second, keyed by the LFID in the verified access token's `http://lfx.dev/claims/username` claim, whatever their organization or tier. Every endpoint stays open to every caller, as ADR-0005 already requires. The Worker keeps forwarding the org and tier headers, and the API leaves them out of rate limiting until a per-tier matrix replaces this limit.

## Alternatives Considered

### Alternative 1: Per-tier pools keyed by organization

- **Pros**: The limit reflects the membership level, as ADR-0005 planned.
- **Cons**: Needs the per-tier numbers and the tier mapping. One integration can use up the budget of everyone else in its organization, and callers without an organization still need a separate key.
- **Why not**: The numbers and the mapping are open product decisions.

### Alternative 2: A flat limit keyed by organization

- **Pros**: One number, and the pool follows the organization as planned.
- **Cons**: Colleagues still share one budget, and callers without an organization need a fallback key.
- **Why not**: A per-LFID key covers every caller the same way with one rule.

### Alternative 3: A flat limit keyed by client IP

- **Pros**: Works before the token is verified.
- **Cons**: Callers behind a shared NAT or CI runner share one budget, and one caller can spread across many IPs.
- **Why not**: The verified token already gives a stable identity.

## Consequences

### Positive

- The limiter keys on the signed token alone, so the unsigned org and tier headers decide nothing while this holds.
- Customer docs state one number for everyone.

### Negative

- The membership tier changes nothing about what a caller gets.
- An organization's budget grows with the number of its users who hold PATs.

### Risks

- 30 requests per second may be too generous for the heaviest endpoints. Load testing sets the evidence for lowering it, and the value lives in one place.
- The org and tier headers start deciding limits again once a per-tier matrix lands, so the Worker-only origin requirement in ADR-0006 applies again from then on.
