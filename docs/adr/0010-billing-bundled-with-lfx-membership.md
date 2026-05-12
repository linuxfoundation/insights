# API access is bundled with LFX membership; no standalone billing in v1

API access is included in the user's existing LFX membership tier. There is no separate billing infrastructure or usage-based pricing.

## Where membership is enforced

Enforcement is split across two boundaries:

**Token-mint time (LFX Self-Serve):** Self-Serve checks Key Contact status via OpenFGA against `v2_organization` entities before issuing an Insights **access token**, and refuses non-Key-Contacts. The precise moment of this check depends on the PAT model chosen (open question — ADR-0015 Q1):

- *New Insights-scoped refresh token:* check happens when the refresh token is first issued at `app.lfx.dev/settings`. Non-Key-Contacts cannot obtain the token at all.
- *Existing PAT reused as refresh token:* all users already hold a PAT. Check happens at `POST /v1/auth/token` exchange time — Self-Serve refuses to mint an Insights access token for non-Key-Contacts even though they possess the PAT.

In either model the check lives in Self-Serve, not in Insights. The `tier` and `org` claims baked into the resulting access token are Self-Serve's authoritative statement of membership status.

**Request time (Insights API):** the Insights API verifies the access token's JWT signature on every request, reads the `tier` and `org` claims from the verified payload, and uses them to enforce rate limits and (in future versions) per-endpoint tier gating. It never re-queries OpenFGA, Postgres member tables, or any other membership system — it trusts what Self-Serve encoded in the token.

**Implication for membership revocation:** revoking a user's LFX membership does not immediately invalidate their existing refresh tokens. Those tokens continue to mint valid access tokens until they are explicitly revoked in `app.lfx.dev/settings`. Membership-driven revocation is a Self-Serve operational concern — Self-Serve is expected to revoke the user's tokens when their membership lapses.