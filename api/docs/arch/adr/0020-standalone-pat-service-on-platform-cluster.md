# The PAT service is a standalone service on the LFX platform cluster

**Date**: 2026-09-14
**Status**: accepted

## Context

[ADR-0006](./0006-pat-token-exchange-for-api-credentials.md) and [ADR-0015](./0015-api-keys-issued-by-lfx-self-serve.md) define the credential model: PATs are created in the LFX Self-Serve App's Developer Settings, stored as salted hashes, and validated during Auth0 Custom Token Exchange via a validation callback that the Auth0 CTE action calls. Both ADRs left open where the PAT service itself runs. ADR-0006's coordination table says "PAT service work in Self-Serve", which is ambiguous between the Self-Serve app codebase, an existing platform service, and a new service.

Three facts constrain the choice:

1. The Self-Serve app (lfx-one) is a BFF with no persistence layer. Its Supabase client is an unused stub, Valkey is a fail-soft cache, and its own placement rules require backend data to live in an upstream service. Credential hashes cannot be stored there.
2. Because the Cloudflare Worker performs the token exchange against Auth0 (per ADR-0006), the PAT service holds no Auth0 client credentials. It only needs durable storage, CRUD for token lifecycle, and a fast validation endpoint. This removes the original argument for extending lfx-v2-auth-service, whose value is its Auth0 Management API integration.
3. The validation callback runs inside an Auth0 action with a 10-second total budget and is called on every Worker cache miss. It needs an O(1) indexed lookup and an availability story independent of any web app's deploy cadence.

There are two candidate clusters: the Insights cluster (Cloudflare-fronted, no platform gateway) and the LFX platform cluster (Heimdall-fronted, hosts lfx-one and the lfx-v2 services).

## Decision

The PAT service is a new standalone service named `lfx-v2-insights-api-pat-service`, in its own repository with its own Postgres database, deployed on the LFX platform cluster. The repository is scaffolded from the existing [lfx-v2 service template in Backstage](https://linuxfoundation.spotifyportal.com/catalog/default/Template/lfx-v2-service/docs), so the project layout, CI, Helm chart, and Heimdall integration match the other lfx-v2 services from day one. The user-facing CRUD surface (create, list, rename, revoke) sits behind the Heimdall gateway and is authorized by the caller's verified user JWT, owner-scoped by the username claim. The validation endpoint for the Auth0 CTE action is authenticated machine-to-machine (shared secret or M2M token, confirmed at T-015). lfx-one integrates over HTTP through its `MicroserviceProxyService` with a new `LFX_V2_PAT_SERVICE` registry key that defaults to the gateway URL, the same pattern as member-service. lfx-v2-auth-service is not changed.

Insights owns delivery of the service per ADR-0006, and the name is deliberately scoped to the Insights API: it is the only audience in v1 and the name makes ownership unambiguous. The token model itself stays audience-generic per ADR-0015 (tokens carry an `aud`, and the `lfi_` prefix identifies the Insights audience), so if LFX later wants a shared PAT store the token format carries over; the service would be generalized or superseded at that point.

## Alternatives Considered

### Alternative 1: Implement inside the Self-Serve app (lfx-one)

- **Pros**: The issuance UI and the token store live in one codebase; no new repo.
- **Cons**: lfx-one has no database and its architecture rules forbid storing backend data in the BFF. The validation callback is an M2M call that does not fit the app's session-cookie auth model and would require carve-outs in code-owner-protected server files. Every Worker cache miss would depend on the availability and deploy cadence of the customer-facing SSR app.
- **Why not**: it requires introducing a persistence layer and an M2M ingress to an app deliberately designed without either; the app's own placement rules say to build this upstream.

### Alternative 2: Extend lfx-v2-auth-service

- **Pros**: Existing service with Auth0 integration and an established CTE precedent (impersonation token exchange); no new deployment.
- **Cons**: The Worker, not the PAT service, performs the exchange, so none of auth-service's Auth0 client machinery is needed. PAT storage and lifecycle share no domain logic with identity management. It couples an Insights-delivered feature to another team's service, roadmap, and release cadence.
- **Why not**: the only shared asset would be the deployment shell; the coupling cost exceeds the savings of not creating a repo.

### Alternative 3: Standalone service on the Insights cluster

- **Pros**: Insights operates that cluster, so deploys, dashboards, and on-call stay fully in-house.
- **Cons**: No Heimdall, so the service must verify Auth0 JWTs and derive the principal itself. The Insights origin is locked to Worker-only access (T-015c), so the PAT service would need its own hostname or a carve-out in that lock for lfx-one and the Auth0 action to reach it. LFX-wide credential material would be hosted on the analytics cluster, blurring the "Insights stores no keys" boundary drawn in ADR-0015. The issuance UI path would cross clusters over the public internet.
- **Why not**: the data is platform credential data and the platform cluster provides the authn edge, database provisioning, and Auth0 reachability (proven by the impersonation flow) for free.

## Consequences

### Positive

- Heimdall provides JWT verification and principal derivation for the CRUD surface; the service never parses raw Auth0 config for user traffic.
- lfx-one integrates with an existing, well-worn pattern (proxy registry key plus shared `MicroserviceUrls` type); no NATS subjects are needed.
- Zero changes to lfx-v2-auth-service; auth0-terraform only gains the CTE profile and the action that calls the validation endpoint.
- Contract-first sequencing: the service's Goa/OpenAPI contract merges before the lfx-one BFF work starts, satisfying lfx-one's upstream-contract-first rule.

### Negative

- One more repository, CI pipeline, and deployment to own. The Backstage template covers the initial scaffold, but Insights still delivers a service that runs on a cluster operated by the platform DevOps team, which needs explicit hosting and on-call agreement (tracked under T-015).
- The Self-Serve issuance UI depends on a cross-team service being deployed before the Developer Settings feature can ship.

### Risks

- The validation endpoint sits on the hot path of every Worker cache miss with a 10-second Auth0 action budget. Mitigation: token format embeds a lookup key (token ID or deterministic keyed hash) so validation is a single indexed query, never a scan over per-row salts.
- If DevOps declines to host or operate an Insights-delivered service on the platform cluster, fall back to Alternative 3. Only ingress and JWT verification change; the API contract, the Worker, and the lfx-one integration are unaffected.
