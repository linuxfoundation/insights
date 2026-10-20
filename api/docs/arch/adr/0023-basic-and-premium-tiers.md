# ADR-0023: Two tiers, basic and premium, set the rate limit and organization endpoint access

**Date**: 2026-10-20
**Status**: accepted
**Deciders**: API team

## Context

[ADR-0005](./0005-tiers-control-rate-limits-only.md) has the membership tier set the size of an organization's rate-limit pool and keeps every endpoint open to every tier. [ADR-0006](./0006-pat-token-exchange-for-api-credentials.md) keys that pool by the organization the Worker resolves. A pool size for each member-service tier class needs numbers that product has not signed off. Callers without an organization, which [ADR-0010](./0010-billing-bundled-with-lfx-membership.md) now forwards, still need a key and a pool. Product wants members to get a higher limit and wants the new organization endpoints to be a premium feature.

## Decision

We will have two public tiers, basic and premium.

- **Who gets which tier**: premium is for callers whose organization holds an LFX membership, as the Tier endpoint reports it. Basic is for everyone else, including callers without an organization. The API maps the member-service tier classes to these two tiers.
- **Rate limits**: each tier has a flat limit of requests per second, keyed by the LFID in the verified access token's `http://lfx.dev/claims/username` claim. Basic gets N, starting at a provisional 30. Premium gets a much higher limit; until load tests settle both numbers, it is also N.
- **Organization endpoints**: only premium callers can use `/organizations/{slug}` and the routes under it. A basic caller gets `403` with `code: tier_forbidden`, as ADR-0005 defines. Every other endpoint stays open to both tiers.

## Alternatives Considered

### Alternative 1: A pool size per member-service tier class, keyed by organization

- **Pros**: The limit follows each membership level, as ADR-0005 planned.
- **Cons**: Needs a number for every class. One integration can use up the budget of everyone else in its organization, and callers without an organization still need a separate key.
- **Why not**: Two tiers cover what product asked for with two numbers.

### Alternative 2: One flat limit for every caller

- **Pros**: One number, and the unsigned org and tier headers decide nothing.
- **Cons**: Membership changes nothing about what a caller gets, and the organization endpoints cannot be kept for members.
- **Why not**: Product wants members to get more.

### Alternative 3: Basic and premium pools keyed by organization

- **Pros**: The pool follows the organization, as ADR-0006 planned.
- **Cons**: Colleagues share one budget, and callers without an organization need a fallback key.
- **Why not**: A per-LFID key covers every caller the same way with one rule.

### Alternative 4: A flat limit keyed by client IP

- **Pros**: Works before the token is verified.
- **Cons**: Callers behind a shared NAT or CI runner share one budget, and one caller can spread across many IPs.
- **Why not**: The verified token already gives a stable identity.

## Consequences

### Positive

- There are two numbers to tune, and customer docs state one limit per tier.
- Callers without an organization get the basic tier and the same LFID key as everyone else.

### Negative

- Until load tests set the numbers, basic and premium share the same limit, so premium differs only in the organization endpoints.
- An organization's budget grows with the number of its users who hold PATs.
- The organization endpoints are the first per-endpoint tier check, which ADR-0005 kept out of v1.

### Risks

- The tier header now decides access to the organization endpoints, so the Worker-only origin requirement in ADR-0006 applies from the start. A request that reaches the origin around the Worker could claim premium.
- The starting value of 30 may be too generous for the heaviest endpoints. Load testing sets the evidence for both numbers, and each lives in one place.
