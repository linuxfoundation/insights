# API docs use VitePress + Scalar, served from `api/docs/`

API documentation is a standalone VitePress site under `api/docs/`, co-located with the service it documents. Scalar is embedded on the reference page and ingests the OpenAPI spec generated from TypeBox schemas on every release.

**Scalar's built-in "try it" client is disabled in v1.** The docs are served from the same origin as the API, and CORS never applies to same-origin requests, so an enabled browser client would bypass the server-to-server boundary set by [ADR-0004](./0004-server-to-server-cors-deny.md) and invite users to paste long-lived PATs into a browser UI.

## Considered Options

- **Mintlify** (rejected): paid, content lives on external infra, customization constrained by their conventions.
- **Extend `frontend/docs/`** (rejected): API docs have their own versioning, navigation, and release cadence that has nothing to do with the Insights frontend. Coupling them means the docs deploy is tied to the frontend deploy, and `frontend/` grows a dependency it doesn't own.
- **`api/docs/` standalone VitePress + Scalar (chosen).** Docs live alongside the service they document. Scalar is embedded on the reference page and reads the generated per-version OpenAPI spec (served at `/v1/openapi.json`; one spec per major version). The reference cannot drift from the implementation. Served at `api.insights.linuxfoundation.org/docs`. Same host as the API. Fastify serves the static VitePress build under `/docs`, no extra subdomain needed.

## Consequences

- API docs (quickstart, authentication, pagination, error reference, changelog) live under `api/docs/`.
- The Scalar reference page loads the per-version spec (`/v1/openapi.json`) at build time.
- Served at `api.insights.linuxfoundation.org/docs`. Docs changes do not require a frontend deploy.
- Scalar's "try it" client stays disabled (same-origin requests would sidestep the ADR-0004 CORS boundary). Engineers must not re-enable it without revisiting ADR-0004.
- Engineers must not move the docs into `frontend/docs/` to "consolidate". The separation is intentional.
