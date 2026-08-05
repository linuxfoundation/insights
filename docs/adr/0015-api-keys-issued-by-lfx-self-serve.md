# API keys are issued by the LFX Self-Serve App

LFX Self-Serve is the issuance and management surface for API credentials. Insights stores no keys, runs no key-management UI, and has no dependency on the Auth0 Management API.

API keys are Personal Access Tokens issued by the LFX Self-Serve App in Developer Settings. A Cloudflare Worker in front of the Insights API exchanges the PAT for a short-lived Auth0-signed JWT (Auth0 Custom Token Exchange) and forwards the request with that JWT plus org/tier headers; the Insights API receives only the JWT and never sees the PAT. The Insights API is a verifier only — it verifies the JWT signature and reads identity from the verified payload. The exchange mechanism is specified in [ADR-0006](./0006-pat-token-exchange-for-api-credentials.md).

> **Note:** this decision assumes LFX Self-Serve can support the required model (Key Contact gating at issuance, PAT storage and revocation, audience prefixing). Coordination with the Self-Serve, Platform, and DevOps teams is required before implementation — see the coordination table in ADR-0006.

## What the Insights API reads from each request

The Insights API reads these values from the Worker-supplied JWT and headers. The final claim-vs-header split follows ADR-0006 variant 4b and is confirmed with DevOps before implementation.

| Value | Source | Purpose |
|---|---|---|
| `iss` | JWT claim | Auth0 issuer URL — used to select the right JWKS and reject foreign tokens. |
| `sub` | JWT claim | User ID — used as the revocation reference and the `customer_id` span attribute in APM traces. |
| `kid` | JWT header | Key ID — selects the right key in the JWKS response for signature verification. |
| `aud` | JWT claim | Service audience — PATs are minted per audience, so the Insights audience is what lets the same mechanism later serve MCP and other LFX surfaces. |
| Organization ID | Worker header | LFX Organization ID — drives the rate-limit pool key (all Key Contacts in the same org share a pool). |
| Tier | Worker header (`x-tier`) | LFX membership tier (`silver` / `gold` / `platinum`) — drives rate-limit pool size and any future per-route tier gating. |

There is no Insights-hosted token endpoint. The exchange happens in the Worker, transparently to the customer, so customers configure a single host (`api.insights.linuxfoundation.org`) and send their PAT directly as `Authorization: Bearer`.

## Revocation

Revocation is owned by LFX Self-Serve: revoking a PAT in Developer Settings makes the next token exchange fail, so no new JWTs can be minted for it. Insights maintains no deny-list and runs no introspection endpoint. The revocation window is bounded by the Worker's token and tier cache TTL (~10 min).

## Credential scoping: audience, not a second token type

The shared LFX PAT service issues the credential, with a distinct Insights audience (and audience-specific prefix, `lfi_`) providing the scoping. That keeps a single token type across LFX while letting Insights reject tokens issued for other services and letting users revoke per audience:

- **User experience:** one token type across every LFX service, created per audience in Developer Settings.
- **Compromise blast radius:** an Insights-audience PAT is scoped to Insights only; revoking it doesn't break the user's other LFX integrations.
- **Scope enforcement:** natural — `aud` already identifies Insights, and the Worker rejects tokens carrying another audience prefix.
- **Revocation granularity:** per-audience, so rotating the Insights credential leaves other LFX integrations intact.

We commit to the issuer (LFX Self-Serve) and to JWKS verification on the Insights side.

## Why this replaces the previous Auth0-based design

The original design stored keys in Auth0 and routed key-creation UI through the LFX Insights frontend (E15), which called the Auth0 Management API. That design was rejected for two reasons:

1. **Duplicate UI.** The LFX Self-Serve App already runs a key-management UI at `app.lfx.dev/settings`. Building a parallel UI inside Insights forces two surfaces to stay in sync and gives users a fragmented experience.
2. **Wrong ownership.** Insights is an analytics API, not an identity service. Owning a signing key, a Management API integration, and a key-lifecycle surface is out of scope for a read-only analytics proxy.

Storing keys in our own Postgres was rejected for the same reason: we'd own the signing key, the revocation surface, and the token lifecycle.
