# Insights API gateway

Cloudflare Worker in front of the Insights public API ([ADR-0006](../../api/docs/arch/adr/0006-pat-token-exchange-for-api-credentials.md), variant 4b). For each request it:

1. Reads `Authorization: Bearer lfi_...` and answers `401` unless the PAT has the `lfx-v2-pat-service` shape: `lfi_`, a 12-character lookup id and a 32-character random part, all base62.
2. Looks up the cached entitlement by the SHA-256 of the PAT (10 minutes).
3. On a miss, exchanges the PAT for an Auth0 JWT. LFIDs individually targeted with `true` on the LaunchDarkly flag at `LD_FLAG_URL` get the admin org and tier; everyone else is resolved from the member-tiers endpoint.
4. Forwards to the API with `Bearer <JWT>`, `x-tier`, `x-org-id` and `x-client-ip`, replacing any client-supplied copies.

The Auth0 exchange (`src/exchange.ts`) is a stub that returns the real response shape. It accepts only `STUB_PAT` and issues a JWT for `STUB_USERNAME`, so set `STUB_USERNAME` to a real LFID to exercise the admin flag and member-tiers; with either unset, every PAT gets `401`. The `production` environment in `wrangler.jsonc` reaches the API through the `INSIGHTS_API` Workers VPC binding (`pnpm run deploy` selects it), with `ORIGIN_URL` set as a secret like the other values. The default config is a separate `insights-api-gateway-dev` Worker with no binding, so `wrangler dev` calls `ORIGIN_URL` from `.dev.vars` directly.

## Local development

```sh
cp .dev.vars.example .dev.vars
pnpm dev
curl -H 'Authorization: Bearer lfi_teststubpat0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' http://localhost:8787/v1-alpha/...
```

Run the API on port 4000 alongside it. `pnpm test` and `pnpm tsc-check` cover the Worker.
