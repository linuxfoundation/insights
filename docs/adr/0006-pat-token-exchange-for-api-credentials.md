# ADR-0006: API credentials are PATs exchanged for short-lived JWTs via Auth0 Custom Token Exchange

**Date**: 2026-08-05
**Status**: accepted
**Deciders**: Eric Searcy, Jordan Evans, Robert Detjens, Jonathan Reimer, Joana Maia, Anil Bostanci

## Context

The Insights Public API needs a long-lived credential that a customer can paste into a script or CI job, that carries the customer's membership tier so rate limits can be enforced, and that LFX can revoke. The Ops/SSO team's constraint is that this must not be built out of OAuth2 refresh-token semantics: a refresh token handed to the user leaves the issuing application's security boundary, an open exchange proxy lets the holder act as that application, and the access token's `exp` becomes the only TTL lever available.

The LFX architecture team compared six options for long-lived credentials in [`lfx-architecture-scratch/2026-05-Long-Lived-API-Credentials`](https://github.com/linuxfoundation/lfx-architecture-scratch/tree/main/2026-05-Long-Lived-API-Credentials), and both Platform and DevOps converged on option 4, Auth0 Custom Token Exchange (CTE) — a mechanism already in production at LFX for Self-Serve impersonation tokens. Because Insights keeps its own API and cluster rather than sitting behind the LFX API Gateway (Heimdall), the exchange needs a proxy on the Insights side; Insights is already behind Cloudflare, so a Cloudflare Worker is the natural home. Credential issuance and management stay in the LFX Self-Serve App — Insights is not an identity service and runs no key-management UI.

## Decision

We will issue long-lived Personal Access Tokens from the LFX Self-Serve App and exchange them for short-lived Auth0-signed JWTs using Auth0 Custom Token Exchange, performed by a Cloudflare Worker in front of the Insights API. The exchange runs on a cache miss, not on every request — the Worker caches the exchanged JWT and the caller's entitlements for ~10 min. Membership org and tier are resolved by the Worker from a purpose-built LFX Tier endpoint and passed to the Insights API as trusted headers (variant 4b); the Insights API verifies the JWT and never sees the PAT.

Request flow:

1. User creates a PAT, named and scoped to an audience, in LFX Self-Serve Developer Settings. For the Insights audience, Self-Serve validates the user's org and tier against the LFX Tier endpoint before issuance. The PAT is shown once; the PAT service stores username, PAT ID, and a salted hash. Insights-audience PATs carry the `lfi_` prefix.
2. User calls `api.insights.linuxfoundation.org` with `Authorization: Bearer lfi_...`.
3. On a cache miss, the Worker validates the `lfi_` prefix and calls Auth0 `POST /oauth/token` with `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`, `subject_token=lfi_...`, the `subject_token_type` URN registered for the PAT profile in the Auth0 tenant, the target `audience`, and the Worker's client credentials (confidential client). Auth0 invokes the Custom Token Exchange action, which calls the PAT service to validate the opaque token and return the identity; Auth0 returns an Auth0-signed access token to the Worker. The exact `subject_token_type` value and client-auth method are fixed with SSO at T-015.
4. The Worker fetches the user's org and member tier from the LFX Tier endpoint, caches the access token and the tier together (~10 min) keyed by a **salted hash of the PAT**, never by the raw token, so the Worker does not become a credential store, and forwards the request to the Insights API as `Bearer <JWT>` plus an `x-tier` header and a companion header carrying the B2B Organization ID. The Worker **strips or overwrites** any client-supplied copy of those headers before forwarding.
5. The Insights API verifies the JWT and reads org and tier from the Worker-set headers, using them as the rate-limit key. Rate limiting itself lives in the API (T-019), not in the Worker. Where a user is Key Contact for several organizations, the highest tier applies and the organization ID connected to that tier is used as the rate-limit pool key; on a tie between orgs at the same tier, the first one returned by the Tier endpoint is used.

Because the org and tier headers are trusted but not cryptographically bound to the JWT, the origin must be reachable only through the Worker (Cloudflare Access / mTLS / shared secret at the origin — mechanism fixed with DevOps at T-015) and the API must reject requests arriving without that proof. Without both, a caller could set its own tier or select another org.

Header and prefix naming follows Eric's option-4b sequence diagram: `lfi_` for Insights-audience PATs and `x-tier` for the tier header. That diagram shows the exchange as `grant=token-exchange` shorthand; this ADR spells the grant out per RFC 8693. The diagram does not name the organization header; that one name is fixed with DevOps at implementation and recorded here, using the same `x-` convention.

Nothing else in the auth model changes: every request still requires a credential (ADR-0009), tier still controls only rate-limit pool size (ADR-0005), and Collections still carry a per-request ownership check (ADR-0007).

## Variants under consideration

Both variants of option 4 remain on the table. 4b is the suggested direction; 4a stays viable if the membership lookup turns out to be better placed inside the PAT service.

| | 4b — tier resolved by the Worker (suggested) | 4a — tier enriched by the PAT service |
|---|---|---|
| Where tier comes from | LFX Tier endpoint, called by both the Self-Serve UI and the Worker | PAT service calls LFX Services, at issuance and at exchange |
| How Insights receives tier | Trusted headers alongside the JWT | Claims inside the JWT |
| PAT service scope | PATs only | PATs + membership lookup |
| Rate limiting | Limiter keys straight off headers, no JWT parsing needed | Requires JWT parsing before the limiter can key on anything |
| Cache control | Token TTL and tier TTL tunable independently | Single TTL, tied to the token |
| Main drawback | One more service for us to build and operate (the Tier endpoint) | Couples the PAT service to membership data; enrichment work sits closer to the Auth0 extensibility environment, which has limited observability and a 10s total budget for all login-time rules |

Picking 4a would require accepting that the PAT service becomes membership-aware, and confirming the enrichment call chain stays inside Auth0's extensibility limits. The Insights team owns building the PAT exchange service and stewards this call, coordinating with DevOps where components land outside the Insights stack.

## Forward compatibility: LFX MCP

The Worker is credential-agnostic: it disambiguates by token prefix. A PAT is exchanged via CTE; a standard OAuth2 access token (device-code or authorization-code flow, which is what an MCP client obtains) skips the exchange and goes straight to JWKS verification. Both paths then receive identical org/tier enrichment and identical rate limiting.

This means phase 2 (MCP server) and phase 3 (CLI) of [IN-1084](https://linuxfoundation.atlassian.net/browse/IN-1084) need no new authentication mechanism — only a client-side flow. PATs are directly usable as MCP client credentials. And because PATs are minted per audience, an Insights MCP server can later be folded into a shared LFX MCP surface by adding an audience rather than redesigning auth. Option 4 supports multiple audiences without modification, which a refresh-token-based credential would not have.

## Alternatives Considered

### Alternative 1: Non-expiring refresh tokens via Self-Serve (option 2)
- **Pros**: Auth0-signed JWTs reach the API with no per-product permission lookup; immediate revocation through the Auth0 Management API; reduced-scope application limits blast radius.
- **Cons**: The refresh token leaves the issuing application's security boundary; the exchange proxy re-injects client credentials, so any holder can act as that application; TTL is pinned to the access token's `exp`, with no independently enforceable shorter lifetime; users must implement a token-swap call themselves; capped at 200 tokens per user per application.
- **Why not**: Rejected by the Ops/SSO team for using OAuth2 semantics to build something that is not an OAuth2 flow. It is also no simpler — the enrichment complexity is identical, it just moves; option 4 adds only PAT hash storage on top, which is not the hard part.

### Alternative 2: Per-product opaque API keys (option 1)
- **Pros**: Lowest infrastructure cost; fully owned by Insights; immediate revocation.
- **Cons**: Insights would own key storage, the signing/validation surface, and its own permission and entitlement lookups.
- **Why not**: Duplicates platform auth and entitlement logic, which is the fastest route to asymmetries and drift between products. It also makes Insights an identity service, which it is not.

### Alternative 3: Device-flow credential CLI (option 3)
- **Pros**: No long-lived secret at rest; hides the token-swap from the user; a natural fit for phase 3.
- **Cons**: Needs an interactive browser step, so it does not cover unattended CI or bot use; an access token scraped from the keychain stays valid for its full lifetime.
- **Why not**: Not rejected — complementary. A CLI can wrap this flow later and emit tokens for other scripts; it is not a substitute for a credential that works headlessly today.

### Alternative 4: CIMD profiles for third-party applications (option 5)
- **Pros**: Partners self-manage client metadata; well suited to third-party MCP clients; low LFX-side infrastructure.
- **Cons**: Token security depends partly on the partner application; cached partner access tokens blunt revocation.
- **Why not**: Solves third-party application onboarding, not first-party scripted access, which is what v1 needs. Worth revisiting for partner-built MCP clients.

### Alternative 5: Exposing temporary access tokens in the UI (option 6)
- **Pros**: Zero implementation cost.
- **Cons**: Not durable, not usable for machine-to-machine work, encourages copy-pasting credentials.
- **Why not**: Does not meet the requirement for a long-lived credential.

## Ownership

The architecture is approved by the LFX architecture team (Eric Searcy, architecture lead) and DevOps; engineering delivery is owned by the Insights team. Insights takes responsibility for building the PAT exchange service — work previously scoped and then deprioritized by Akrites — and, in variant 4b, for building the LFX Tier endpoint that both the Self-Serve UI and the Worker call. Insights also stewards the effort end to end, including coordination with DevOps where components land outside the Insights stack (Auth0 tenant configuration, Cloudflare Worker deployment). Per the 2026-05-19 review call, Insights contributes the required Self-Serve changes upstream rather than forking, with Platform support.

## Coordination required

| Team / owner | What we need |
|---|---|
| LFX architecture (Eric Searcy, architecture lead) | Architectural sign-off on the option-4 direction and on the 4a/4b shape |
| LFX DevOps / Cloud Ops (Robert Detjens) | Cloudflare Worker on the Insights zone; Auth0 CTE grant and client configuration; token and tier cache TTLs |
| SSO / Auth0 administration (Alan Sherman) | Auth0 tenant changes, CTE enablement, registration of the PAT service as the token validator |
| LFX Platform / Self-Serve engineering (Jordan Evans) | PAT service: generation, salted-hash storage, rename and revoke, audience prefixing, and the Auth0 validation callback — reusing the CTE path already live for Self-Serve impersonation tokens |
| LFX v2 platform / member data | The membership source of truth behind the LFX Tier endpoint: how to resolve an Auth0 `sub` to an organization ID and member tier, plus where the endpoint is deployed and who operates it long-term. Multi-org responses must be returned in a **stable, deterministic order** (not set/map iteration), since the first org at the highest tier becomes the rate-limit pool key on ties. |
| Product / Design (Jonathan Reimer, Nuno, Kieran) | Self-Serve Developer Settings UX; Key Contact gating rules; tier → rate-limit mapping, including the highest-tier-wins rule across multiple orgs and the first-returned-org tie-break on equal tiers |
| Insights engineering | PAT exchange service build-out, the LFX Tier endpoint, Worker logic, API-side JWT and header verification, rate limiting, customer documentation |

## Consequences

### Positive
- Industry-standard PAT ergonomics: one credential, sent directly as `Authorization: Bearer`, with no client-side token-swap call.
- The Insights API stays a verifier. No key storage, no key-management UI, no Auth0 Management API dependency.
- Rate-limit inputs arrive as headers, so the limiter needs no JWT parsing.
- No Auth0 200-token-per-user cap, because PATs live in our own store, and optional PAT expiry becomes possible.
- Token and entitlement caches have independent TTLs.
- Phases 2 and 3 (MCP, CLI) and a future shared LFX MCP surface reuse this path unchanged.
- No Insights-hosted token endpoint to build: the exchange is transparent to the customer, who configures a single host for API calls.

### Negative
- Highest infrastructure complexity of the six options: a Worker, a PAT service, a Tier endpoint, and Auth0 tenant configuration, touching four teams.
- Insights takes on delivery of two components that are not Insights-specific — the PAT exchange service and the Tier endpoint — and still depends on Platform and DevOps for the Auth0 and Cloudflare pieces it does not own.
- Two extra hops per uncached request (exchange, tier lookup) on top of the API call.

### Risks
- **4a vs 4b not finally settled.** Mitigation: the difference is confined to where tier resolution lives; the PAT, exchange, and verification path are identical, so the decision can be made without reworking the rest.
- **Revocation is not immediate** — bounded by the Worker's token and tier cache TTL (~10 min). Mitigation: align the JWT `exp` requested from Auth0 with the Worker cache TTL so both expire together, keeping JWT semantics and cache lifetime in sync; keep the TTL short and document the window for customers.
- **Header spoofing if the origin is directly reachable.** The org and tier headers are trusted, not signed. Mitigation: lock the origin to Worker-only access and strip client-supplied copies of those headers at the Worker; both are named requirements on T-015b and T-017, not assumptions.
- **Cross-team delivery risk** — four teams on one critical path. Mitigation: Insights stewards coordination (see Ownership) and the dependencies above are tracked as named deliverables rather than assumptions.
