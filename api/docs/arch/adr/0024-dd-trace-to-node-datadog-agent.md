# ADR-0024: The API reports to its node's Datadog agent through dd-trace

**Date**: 2026-10-26
**Status**: accepted
**Deciders**: API team

## Context

ADR-0019 instrumented the API with the OpenTelemetry SDK and an `opentelemetry-collector` sidecar exporting to Datadog, following the LFX platform standard (LFX-0003). That design suits the LFX platform cluster, where the Datadog agent belongs to another team. The API instead runs in the production cluster it shares with the crowd.dev services. That cluster's Datadog agent runs on every node and is configured alongside the API's own deployment. It already collects every pod's logs, takes traces on port 8126 and DogStatsD metrics on port 8125, and the crowd.dev services report through it with `dd-trace`. Its OpenTelemetry (OTLP) receiver is off, and Datadog is the only observability backend in use.

## Decision

We will instrument the API with `dd-trace`, sending traces and DogStatsD metrics to the Datadog agent on the pod's node, as the crowd.dev services do. This amends ADR-0019 and the trace correlation section of ADR-0018:

- `dd-trace` traces each request as `fastify.request`, named by route template, with its Postgres and outbound HTTP calls beneath it. Health probes are not traced.
- The caller's LFID and tier go on the trace's root span through `tracer.setUser`, as `usr.id` and `usr.tier`. The `insights.api.requests` DogStatsD counter counts authenticated requests by route, status, LFID and tier.
- Log lines carry `dd.trace_id` and `dd.span_id` from `dd-trace`'s log injection, in place of OpenTelemetry's `trace_id` and `span_id`.
- The request ID is the Datadog trace ID: 128-bit, logged as 32-char hex. Inbound W3C `traceparent` is still honoured, and outbound calls carry it alongside `x-datadog-*` headers.
- Sampling follows the `dd-trace` default, which the agent tunes per service. APM trace metrics (hits, errors, latency percentiles) count every request whatever is sampled.

## Alternatives Considered

### OpenTelemetry SDK with a collector sidecar (ADR-0019 as written)

- **Pros**: follows LFX-0003; vendor neutral; self-contained in the API pod.
- **Cons**: a collector container and its config in every API pod, plus a copy of the Datadog API key in the namespace.
- **Why not**: it rebuilds what the node agent already does for every other pod in the cluster.

### OpenTelemetry SDK sending OTLP to the node agent

- **Pros**: follows LFX-0003; no sidecar.
- **Cons**: enabling the agent's OTLP receiver restarts the agent on every node, including those running the crowd.dev production services. The OpenTelemetry Node SDK spans about ten 0.x packages, several of which were renamed or deprecated while this was being built.
- **Why not**: its main gain is portability, and we have no plans for a second backend.

## Consequences

### Positive

- The only cluster change is environment on the API pod: `DD_AGENT_HOST` from the node IP, and `DD_ENV`.
- One mature package, configured like every other service in the cluster.
- Per-endpoint p50/p95/p99, hits and errors come from APM trace metrics without custom metrics. The profiler, runtime metrics and App and API Protection are available later through configuration.

### Negative

- The instrumentation is Datadog-specific and departs from LFX-0003. Moving to another backend means replacing `src/instrumentation.ts`, `src/telemetry.ts` and the `dd.*` log fields.

### Risks

- The LFID tag gives the counter one series per caller, route and status, so its cost grows with adoption. Revisit before general availability; dropping `usr.id` from the counter leaves per-caller analysis to trace search on `@usr.id`.
- DogStatsD aggregates in-process for 10 seconds, so a rollout can drop up to 10 seconds of a pod's counts. Accepted at current volume.
