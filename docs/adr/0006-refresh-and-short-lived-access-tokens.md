# Refresh tokens are long-lived; access tokens are short-lived

The customer-facing credential is a **refresh token** issued by the LFX Self-Serve App at `app.lfx.dev/settings`. It does not expire automatically. Rotation is encouraged (documented best practice) but never enforced — multiple active refresh tokens per User are supported so rotation is zero-downtime: mint new → switch integrations → revoke old.

Customer code exchanges the refresh token for a short-lived **access token** (~15 min; exact lifetime confirmed at T-015) via `POST api.insights.linuxfoundation.org/v1/auth/token`. That endpoint is a thin proxy to LFX Self-Serve's `/token` endpoint (RFC 6749 §6 `grant_type=refresh_token`). The Insights API forwards the request and returns the response verbatim — it does not mint, validate, or store refresh tokens.

The access token is what the Insights API JWKS-verifies on every request. It carries the `sub`, `org`, `tier`, `iss`, `kid`, and possibly `aud` claims. The Insights API never receives refresh tokens on `/v1/...` endpoints.

## Revocation

Revocation is owned by LFX Self-Serve. When a user revokes a refresh token in `app.lfx.dev/settings`, the next `POST /v1/auth/token` call (forwarded to Self-Serve) fails with `400 invalid_grant` — the customer's code can no longer mint new access tokens. Already-issued access tokens continue to work until their `exp`. Revocation lag is bounded by the access token's natural lifetime (~15 min). Insights maintains no deny-list and runs no introspection endpoint.

## Why not long-lived JWTs sent directly as Bearer

The previous design issued a long-lived JWT that the customer sent as `Authorization: Bearer` on every request. Two problems:

1. **No natural expiry on a leaked token.** A long-lived JWT that escapes into logs, error reports, or a compromised system stays valid indefinitely. Revocation requires Insights to run a per-request introspection-with-cache check — extra infrastructure for a problem the refresh-token model solves natively (leaked access token expires in ~15 min; leaked refresh token can only mint new access tokens, which the legitimate owner can stop by revoking it).

2. **Revocation is ambiguous.** "Revoking" a long-lived JWT that has been cryptographically signed means nothing to a verifier that only checks the signature — the token remains valid until the key is rotated. Rotating the JWKS key revokes all tokens at once, not just one user's. The refresh-token model avoids this entirely.
