# Insights API gateway

Cloudflare Worker in front of the Insights public API ([ADR-0006](../../api/docs/arch/adr/0006-pat-token-exchange-for-api-credentials.md), variant 4b). For each request it:

1. Reads the `Authorization: Bearer` token and answers `401` without one. An `lfi_` PAT continues below; any other token takes the [JWT path](#jwt-path).
2. Looks up the cached entitlement by a salted hash of the PAT (10 minutes).
3. On a miss, exchanges the PAT for an Auth0 access token through Custom Token Exchange (`subject_token_type` `urn:lfx.dev:pat`, audience `INSIGHTS_API_AUDIENCE`), passing the caller's IP as `auth0-forwarded-for`. Auth0 honors that header only when the Worker's Auth0 client has "Trust Token Endpoint IP Header" enabled; otherwise failed exchanges are throttled against the Worker's own IPs. Auth0 validates the PAT with the PAT service and resolves its owner, and a rejected PAT gets `401`, while Auth0 throttling, a validate timeout or a failed owner lookup surfaces as a server error. The token must carry the `http://lfx.dev/claims/username` claim, which identifies the caller for the next step. LFIDs individually targeted with `true` on the LaunchDarkly flag at `LD_FLAG_URL` get the admin org and tier; everyone else is resolved from the member-tiers endpoint, called with an M2M token. The exchange and the M2M token both authenticate the Worker's Auth0 client (`M2M_CLIENT_ID`) with a private key JWT assertion signed by `M2M_PRIVATE_KEY` (a base64-encoded PKCS#8 PEM). A caller the endpoint returns no organization for is forwarded all the same, with the entitlement cached for the same TTL.
4. Forwards to the API with `Bearer <JWT>` and `x-client-ip`, plus `x-tier` and `x-org-id` when the caller resolved to an organization. Client-supplied copies of all three are dropped either way.

The `production` environment in `wrangler.jsonc` reaches the API through the `INSIGHTS_API` Workers VPC binding (`pnpm run deploy` selects it), with `ORIGIN_URL` set as a secret like the other values. The default config is a separate `insights-api-gateway-dev` Worker with no binding, so `wrangler dev` calls `ORIGIN_URL` from `.dev.vars` directly.

## JWT path

Auth0 access tokens with the `INSIGHTS_API_AUDIENCE` audience, such as the ones the LFX MCP gets from its token exchange ([ADR-0027](../../api/docs/arch/adr/0027-mcp-calls-insights-api-with-token-exchange.md)), are accepted only from the Auth0 clients listed in `JWT_CLIENT_IDS` (comma-separated client ids). The path is off while `JWT_CLIENT_IDS` is unset or empty: every such token gets `401` before any key or tier lookup. With clients listed, the Worker:

1. Verifies the token against the key set at `.well-known/jwks.json` under `M2M_ISSUER_URL`: issuer `M2M_ISSUER_URL`, audience `INSIGHTS_API_AUDIENCE`, RS256 only, and expiry, which the token must carry. A bad token gets `401`, while a key set that can't be fetched surfaces as a server error.
2. Requires the token's `client_id` claim (`azp` when the token has no `client_id`) to be in `JWT_CLIENT_IDS`, and a non-empty `http://lfx.dev/claims/username` claim.
3. Resolves the org and tier for that username as for a PAT, cached for 10 minutes under a salted hash of the username. Every request is verified; the cache only skips the tier lookup.
4. Forwards the caller's own token with the same Worker-set headers as a PAT request.

## Deployment

A merge to `main` deploys the Worker through the Public API Deploy workflow (`.github/workflows/public-api-deploy.yaml`) when its paths differ from the commit the `production-api-gateway` environment last deployed successfully, so a failed or superseded deploy is retried by the next run. It deploys after the API when both changed. A request without a PAT must then get the Worker's `401`, or the workflow rolls back to the previous version. Each run is recorded under the `production-api-gateway` environment in the repository's Deployments.

## Local development

```sh
cp .dev.vars.example .dev.vars
pnpm dev
curl -H 'Authorization: Bearer lfi_...' http://localhost:8787/v1-alpha/...
```

Auth0 sets the username claim only for the production audience, so an end-to-end run needs the production Auth0 values and a PAT created in production Self-Serve Developer Settings. Run the API on port 4000 alongside it. `pnpm test` and `pnpm tsc-check` cover the Worker.
