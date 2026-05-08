# TypeBox for code-first OpenAPI schema generation

We use TypeBox to define request/response schemas in TypeScript; the OpenAPI spec is generated from those definitions rather than written by hand or inferred from decorators.

TypeBox works by making a single object definition serve two roles simultaneously: it is a valid JSON Schema (consumed by Fastify at runtime for request validation and response serialization) and a TypeScript type (derived via `Static<typeof Schema>` at compile time). There is no conversion step and no second representation — the object literally is both things at once.

Fastify's first-class TypeBox support (`@fastify/type-provider-typebox` + `@fastify/swagger`) means the OpenAPI spec is generated from the same schema objects that validate requests. The spec cannot drift from the implementation because they share one source.

Zod was considered: it has a more ergonomic API and a larger community, but its native representation is not JSON Schema — a conversion layer (`zod-to-json-schema`) is required, which reintroduces a transformation step that can silently diverge. The Fastify+TypeBox integration is zero-transformation.

Hand-written OpenAPI YAML was rejected: with ~100 endpoints, drift between spec and implementation is a certainty at scale, not a risk to manage.

Engineers must not introduce a parallel validation library (Zod, Joi, class-validator) into `/api` — TypeBox is the single validation and schema boundary.
