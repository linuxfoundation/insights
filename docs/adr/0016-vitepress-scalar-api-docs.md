# API docs use VitePress + Scalar, served from `api/docs/`

API documentation is a standalone VitePress site under `api/docs/`, co-located with the service it documents. Scalar is embedded on the reference page and ingests the OpenAPI spec generated from TypeBox schemas on every release.

## Considered Options

- **Mintlify** — rejected: paid, content lives on external infra, customization constrained by their conventions.
- **Extend `frontend/docs/`** — rejected: API docs have their own versioning, navigation, and release cadence that has nothing to do with the Insights frontend. Coupling them means the docs deploy is tied to the frontend deploy, and `frontend/` grows a dependency it doesn't own.
- **`api/docs/` standalone VitePress + Scalar (chosen)** — docs live alongside the service they document. Scalar is embedded on the reference page and reads `api/openapi.json` — the reference cannot drift from the implementation. Served at `api.insights.linuxfoundation.org/docs` — same host as the API; Fastify serves the static VitePress build under `/docs`, no extra subdomain needed.

## Consequences

- API docs (quickstart, authentication, pagination, error reference, changelog) live under `api/docs/`.
- The Scalar reference page loads `api/openapi.json` at build time.
- Served at `api.insights.linuxfoundation.org/docs`. Docs changes do not require a frontend deploy.
- Engineers must not move the docs into `frontend/docs/` to "consolidate" — the separation is intentional.
