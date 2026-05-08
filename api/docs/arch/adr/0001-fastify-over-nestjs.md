# Fastify over NestJS for the public API service

We chose Fastify as the HTTP framework for `/api` rather than NestJS. NestJS was the leading alternative — it's the de-facto "enterprise Node.js" choice and familiar to most backend developers. We rejected it because: (1) NestJS's decorator-based DI and module system adds ~3–5× the boilerplate for a service whose only job is validating a JWT, proxying a Tinybird query, and shaping the response; (2) NestJS couples schema validation to class-validator/class-transformer, whereas we want TypeBox for code-first OpenAPI generation; (3) Fastify's plugin isolation maps cleanly onto our endpoint-group structure; and (4) Fastify's `genReqId` hook is a first-class primitive for the Request ID propagation pattern we need. The trade-off is that Fastify's ecosystem is smaller and less opinionated — future engineers should resist the urge to add NestJS-style decorators or a DI framework unless the service grows substantially beyond its current scope.

## Considered Options

- **NestJS** — rejected: too much ceremony for a thin proxy service; forces class-validator coupling
- **Express** — rejected: no built-in schema validation, slower than Fastify, no `genReqId`
- **Hono** — rejected: designed for edge runtimes (Cloudflare Workers, Deno Deploy) first and Node second — the Tinybird and Postgres clients rely on Node-native APIs (`net`, `tls`, `Buffer`) that edge runtimes don't provide, so running Hono on Node requires an adapter layer that reintroduces the compatibility risk Hono was chosen to avoid. Fastify is Node-native and battle-tested at scale with no runtime adapter between the framework and the OS.
