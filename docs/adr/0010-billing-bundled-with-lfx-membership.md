# API access is bundled with LFX membership; no standalone billing in v1

API access is included in the user's existing LFX membership tier. There is no separate billing infrastructure or usage-based pricing.

## Where membership is enforced

Enforcement is split across two boundaries:

**PAT-issuance time (LFX Self-Serve):** Public API access is for Key Contacts, so Self-Serve gates issuance of an Insights-audience **Personal Access Token** on Key Contact status and refuses users who do not hold it. The check lives in Self-Serve, not in Insights. **Assumption:** the underlying membership-of-record mechanism is expected to be OpenFGA relationships against `v2_organization` entities — this has not been confirmed with Platform and needs verifying at T-015.

**Request time (Insights API):** the Insights API verifies the JWT signature on every request and reads the caller's org and membership tier from the headers set by the Cloudflare Worker, using them to enforce rate limits and (in future versions) per-endpoint tier gating. It never re-queries OpenFGA, Postgres member tables, or any other membership system — it trusts what the Worker resolved from the LFX Tier endpoint (see [ADR-0006](./0006-pat-token-exchange-for-api-credentials.md)). **Assumption:** the LFX Tier endpoint that resolves an Auth0 `sub` to an organization ID and member tier does not exist yet and is a delivery item, not a given.

**Implication for membership revocation:** revoking a user's LFX membership does not immediately invalidate their existing PATs. A PAT keeps exchanging successfully until it is explicitly revoked in Developer Settings; a tier change propagates only once the Worker's tier cache expires (~10 min). Membership-driven revocation is a Self-Serve operational concern — Self-Serve is expected to revoke the user's PATs when their membership lapses.