# ADR-0026: The API docs are served by the Insights web app at /docs/api, behind LFID login

**Date**: 2026-11-04
**Status**: accepted
**Deciders**: API team

## Context

[ADR-0016](./0016-vitepress-scalar-api-docs.md) served the VitePress + Scalar docs from the API under `/docs`. The Cloudflare Worker in front of the API requires a PAT on every path, so a browser could not open them. The docs should sit next to the product docs on the Insights site, and only signed-in LFID users should see them. The API's NetworkPolicy admits only the Cloudflare tunnel, because the API trusts the `x-tier` and `x-org-id` headers.

## Decision

We will build the API docs into the frontend image and serve them at `insights.linuxfoundation.org/docs/api` from a Nuxt server middleware that requires an Insights session. Anonymous visitors are redirected to login, and the footer links to the docs for logged-in users only. The OpenAPI spec is exported at build time with `openapi:export`, and the API no longer serves `/docs`. The Web API reference and the Health Score v2 migration guide, which the product docs served publicly at `/docs/api`, move into this site and sit behind the same login.

## Alternatives Considered

### Alternative 1: Proxy /docs/api from the web app to the API

- **Pros**: the reference always shows the spec of the deployed API.
- **Cons**: the API's NetworkPolicy would have to admit the web app, and the web app would need the API's in-cluster address.
- **Why not**: admitting a second client to an API that trusts its tier headers widens the trust boundary for a docs site.

### Alternative 2: Copy the docs into the web app's public/ folder

- **Pros**: the same mechanism as the product docs.
- **Cons**: Nitro serves `public/` before any server middleware runs.
- **Why not**: a login check cannot run in front of `public/`.

## Consequences

### Positive

- The docs and the product docs share one host and one navigation entry point.
- The API's trust boundary is unchanged.
- The API image no longer builds or serves the docs site.

### Negative

- The reference shows the spec from the commit the frontend was built from. A frontend deploy that lags an API deploy shows the older spec until the next frontend deploy.
- Docs changes need a frontend deploy.

### Risks

- A gated page cached by the web app's catch-all Redis rule would reach anonymous visitors. The `/docs/api` route rules set `cache: false` and the middleware sends `Cache-Control: private, no-store`.
