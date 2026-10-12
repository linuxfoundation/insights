# API access is bundled with LFX membership; no standalone billing in v1

API access is included in the user's existing LFX membership tier. There is no separate billing infrastructure or usage-based pricing.

> Amended 2026-10-12: the request-time fail-closed rule under "Where membership is enforced" was dropped. The Worker forwards a caller the Tier endpoint returns no organization for, without org and tier headers, instead of answering `403`.

## Where membership is enforced

Enforcement is split across two boundaries:

**PAT-issuance time (LFX Self-Serve):** Public API access is for Key Contacts, so Self-Serve gates issuance of an Insights-audience **Personal Access Token** on Key Contact status and refuses users who do not hold it. The check lives in Self-Serve, not in Insights. **Assumption:** the underlying membership-of-record mechanism is expected to be OpenFGA relationships against `v2_organization` entities; this has not been confirmed with Platform and needs verifying at T-015.

**Request time (Insights API):** the Insights API verifies the JWT signature on every request and reads the caller's org and membership tier from the headers set by the Cloudflare Worker, using them to enforce rate limits and (in future versions) per-endpoint tier gating. It never re-queries OpenFGA, Postgres member tables, or any other membership system. It trusts what the Worker resolved from the LFX Tier endpoint (see [ADR-0006](./0006-pat-token-exchange-for-api-credentials.md)). **Assumption:** the LFX Tier endpoint that resolves an Auth0 `sub` to an organization ID and member tier does not exist yet and is a delivery item, not a given.

**Implication for membership revocation:** revoking a user's LFX membership does not immediately invalidate their existing PATs; the PAT keeps exchanging successfully until it is explicitly revoked in Developer Settings. What the tier lookup bounds is the tier, not access: once the Worker's cache expires (~10 min), the next LFX Tier endpoint call reflects the lapsed membership and the org and tier headers stop being set.

**No request-time gate on that lookup (amended 2026-10-12).** If the Tier endpoint returns no active organization or tier for the caller (membership lapsed, Key Contact status removed, org deleted), the Worker forwards the request with the JWT and without the org and tier headers; the API treats such a caller as having no membership tier. The rule until 2026-10-12 was to reject these requests with `403`. It was dropped so that a valid PAT keeps API access whatever the holder's Key Contact status, with the tier shaping rate limits only. A Tier endpoint that is unreachable (5xx, timeout) is a different case and is treated as a Worker-side failure, not as an entitlement decision; the retry and degraded-mode policy for that is a T-015 item.

Self-Serve is still expected to revoke a user's PATs when their membership lapses; until it does, the lookup only strips the caller's tier.
