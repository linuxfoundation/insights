# API docs use VitePress + Scalar, served from `api/docs/site/`

API documentation is a standalone VitePress site under `api/docs/site/`, co-located with the service it documents. Scalar is embedded on the reference page and ingests the OpenAPI spec generated from TypeBox schemas on every release. Sibling `api/docs/arch/` holds engineering planning (PUBLIC_API_PLAN, CONTEXT, ADRs, architecture-review) and is not part of the published site.

## Considered Options

- **Mintlify** — rejected: paid, content lives on external infra, customization constrained by their conventions.
- **Extend `frontend/docs/`** — rejected: API docs have their own versioning, navigation, and release cadence that has nothing to do with the Insights frontend. Coupling them means the docs deploy is tied to the frontend deploy, and `frontend/` grows a dependency it doesn't own.
- **`api/docs/site/` standalone VitePress + Scalar (chosen)** — docs live alongside the service they document. Scalar is embedded on the reference page and reads the generated OpenAPI spec — the reference cannot drift from the implementation. Served at `api.insights.linuxfoundation.org/docs` — same host as the API; Fastify serves the static VitePress build under `/docs`, no extra subdomain needed.

## Consequences

- Customer-facing API docs (quickstart, authentication, pagination, error reference, changelog) live under `api/docs/site/`.
- Engineering planning docs live under `api/docs/arch/` and are never built into the published site.
- The Scalar reference page loads the generated OpenAPI spec at build time.
- Served at `api.insights.linuxfoundation.org/docs`. Docs changes do not require a frontend deploy.
- Engineers must not move the docs into `frontend/docs/` to "consolidate" — the separation is intentional.
