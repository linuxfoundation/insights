# API keys are issued by the LFX Self-Serve App

API keys are refresh tokens issued by the LFX Self-Serve App at `app.lfx.dev/settings`. The Insights API exposes a proxied `/v1/auth/token` endpoint (forwarding to Self-Serve's `/token`) so customers configure only one host. Customer code exchanges refresh tokens for short-lived access tokens via that proxy (per ADR-0006); the Insights API receives only access tokens on actual API requests. The Insights API is a verifier only: it fetches the LFX Self-Serve JWKS endpoint, verifies the access token's signature, and reads identity + authorization claims from the verified payload. Insights stores no keys, runs no key-management UI, and has no dependency on the Auth0 Management API.

## JWT claims used by the Insights API

These claims live on the **access token**, not the refresh token.

| Claim | Purpose |
|---|---|
| `iss` | LFX Self-Serve issuer URL — used to select the right JWKS and reject foreign tokens. |
| `sub` | User ID — used for revocation reference and the `customer_id` field in error envelopes. |
| `org` | LFX Organization ID — drives the rate-limit pool key (all Key Contacts in the same org share a pool). Exact claim name confirmed at T-015. |
| `tier` | LFX membership tier (`silver` / `gold` / `platinum`) — drives rate-limit pool size and any future per-route tier gating. Confirmed at T-015. |
| `kid` | Key ID — selects the right key in the JWKS response for signature verification. |
| `aud` | Service audience — required if the open question below resolves to using the existing platform PAT with scope enforcement. |

## Token endpoint proxy

The Insights API exposes `POST /v1/auth/token` as a thin passthrough to LFX Self-Serve's `/token` endpoint. Insights forwards the request body and headers verbatim and returns the response verbatim. It does not mint, validate, or persist refresh tokens. The proxy exists purely so customers configure a single host (`api.insights.linuxfoundation.org`) for both API calls and access-token minting.

Failure modes: if Self-Serve returns a 4xx or 5xx, Insights forwards the response as-is. If Self-Serve is unreachable, Insights returns `503` with `code: upstream_unavailable` matching its standard error envelope.

## Revocation

Revocation is owned by LFX Self-Serve. When a user revokes a refresh token in `app.lfx.dev/settings`, the next `POST /v1/auth/token` call (forwarded to Self-Serve) fails with `400 invalid_grant` — the customer's code can no longer mint new access tokens. Already-issued access tokens continue to work until their `exp` (~15 min). Insights maintains no deny-list and runs no introspection endpoint — revocation lag is bounded by the access token's natural lifetime.

## Open question: reuse existing platform PAT vs mint a new Insights-scoped refresh token

**Undecided.** This is a product question to resolve with the LFX Self-Serve team at T-015. Both options are valid:

| Aspect | Reuse existing `app.lfx.dev/settings` PAT as refresh token | Mint new Insights-scoped refresh token |
|---|---|---|
| User experience | One token across every LFX service — best UX. | Extra "Create Insights API token" step in `app.lfx.dev/settings`. |
| Compromise blast radius | A leaked refresh token grants access to whatever the platform PAT covers — wider than Insights alone. | A leaked Insights refresh token is scoped to Insights only; revoking it doesn't break the user's other LFX integrations. |
| Scope enforcement | Requires a service-scope claim (`aud: insights.linuxfoundation.org` or a `scopes` array) so Insights can refuse tokens issued for unrelated services. | Natural: `aud`/`iss` already implies Insights. |
| Claim requirements | The existing PAT may need additional claims (`org`, `tier`) if they're not already present. | LFX Self-Serve mints with the exact claim shape Insights needs. |
| Revocation granularity | Revoking the platform PAT loses every LFX integration at once. | Per-service revocation — rotating the Insights refresh token leaves other LFX integrations intact. |
| LFX Self-Serve team work | Extend/add claims on an existing token type. | New token type + UI affordance in `app.lfx.dev/settings`. |

We commit to the issuer (LFX Self-Serve) and the verification path (JWKS from LFX Self-Serve). The token form is decided at T-015.

## Why this replaces the previous Auth0-based design

The original design stored keys in Auth0 and routed key-creation UI through the LFX Insights frontend (E15), which called the Auth0 Management API. That design was rejected for two reasons:

1. **Duplicate UI.** The LFX Self-Serve App already runs a key-management UI at `app.lfx.dev/settings`. Building a parallel UI inside Insights forces two surfaces to stay in sync and gives users a fragmented experience.
2. **Wrong ownership.** Insights is an analytics API, not an identity service. Owning a signing key, a Management API integration, and a key-lifecycle surface is out of scope for a read-only analytics proxy.

Storing keys in our own Postgres was rejected for the same reason: we'd own the signing key, the revocation surface, and the token lifecycle.
