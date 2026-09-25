# Insights API gateway

Cloudflare Worker in front of the Insights public API ([ADR-0006](../../api/docs/arch/adr/0006-pat-token-exchange-for-api-credentials.md), variant 4b). For each request it:

1. Reads `Authorization: Bearer lfi_...` and answers `401` without one.
2. Looks up the cached entitlement by a salted hash of the PAT (10 minutes).
3. On a miss, exchanges the PAT for an Auth0 JWT and resolves the user's org and tier from the member-tiers endpoint.
4. Forwards to the API with `Bearer <JWT>`, `x-tier`, `x-org-id`, `x-worker-secret` and `x-client-ip`, replacing any client-supplied copies.

The Auth0 exchange (`src/exchange.ts`) is a stub that returns the real response shape. The origin is reached over `ORIGIN_URL` until the Workers VPC binding exists.

## Local development

```sh
cp .dev.vars.example .dev.vars
pnpm dev
curl -H 'Authorization: Bearer lfi_test' http://localhost:8787/v1-alpha/...
```

Run the API on port 4000 alongside it. `pnpm test` and `pnpm tsc-check` cover the Worker.
