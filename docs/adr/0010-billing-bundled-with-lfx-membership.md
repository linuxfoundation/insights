# API access is bundled with LFX membership; no standalone billing in v1

API access is included in the user's existing LFX membership tier. There is no separate billing infrastructure or usage-based pricing.

## Where membership is enforced

Enforcement is split across two boundaries:

**Token-mint time (LFX Self-Serve):** when a user creates a refresh token at `app.lfx.dev/settings`, Self-Serve checks the user's organization against its membership-of-record system (currently OpenFGA relationships against `v2_organization` entities — confirm exact mechanism at T-015) and refuses to mint a token for non-Key-Contacts. The `tier` and `org` claims baked into the resulting access token are Self-Serve's authoritative statement of membership status.

**Request time (Insights API):** the Insights API verifies the access token's JWT signature on every request, reads the `tier` and `org` claims from the verified payload, and uses them to enforce rate limits and (in future versions) per-endpoint tier gating. It never re-queries OpenFGA, Postgres member tables, or any other membership system — it trusts what Self-Serve encoded in the token.

**Implication for membership revocation:** revoking a user's LFX membership does not immediately invalidate their existing refresh tokens. Those tokens continue to mint valid access tokens until they are explicitly revoked in `app.lfx.dev/settings`. Membership-driven revocation is a Self-Serve operational concern — Self-Serve is expected to revoke the user's tokens when their membership lapses.