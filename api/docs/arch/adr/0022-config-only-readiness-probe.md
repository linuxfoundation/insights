# ADR-0022: Readiness checks this pod's configuration only

**Date**: 2026-10-01
**Status**: accepted
**Deciders**: API team

## Context

ADR-0009 defines `/health/live` and `/health/ready` as Kubernetes probes. The API reads from the Tinybird workspace and the CM Postgres database, and both are shared by every pod. A readiness probe that pings an upstream fails on all pods at once when that upstream degrades, so the whole service leaves rotation even for routes that do not touch it.

## Decision

We will keep `/health/live` unconditional and make `/health/ready` return 503 only when this pod's own configuration is missing or invalid. Upstream outages surface as 503 from the routes that use the upstream.

## Alternatives Considered

### Alternative 1: Ping every upstream in readiness

- **Pros**: A pod with a broken connection leaves rotation.
- **Cons**: A shared outage removes every pod, and unrelated routes go down with it.
- **Why not**: Readiness is a per-pod signal, and a shared dependency cannot distinguish one pod from another.

### Alternative 2: Liveness only

- **Pros**: The simplest probe.
- **Cons**: A pod started without its database or Tinybird settings receives traffic.
- **Why not**: Missing configuration is a per-pod fault that readiness can catch at no cost.

## Consequences

### Positive

- An upstream outage degrades only the routes that depend on it.
- A misconfigured rollout stays out of rotation.

### Negative

- Readiness does not prove a pod can reach its upstreams.

### Risks

- A pod with correct settings but a broken network path still receives traffic. Route-level 503 responses and upstream monitoring cover this.
