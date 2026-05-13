# OpenTelemetry instrumentation; OTel trace ID is the request ID

The API service is instrumented with OpenTelemetry from day one. Inbound and outbound HTTP context propagation, log↔trace correlation, and custom metrics all flow through a single OTel SDK rather than ad-hoc per-concern integrations. This inherits the LFX platform standard from [lfx-architecture-decisions/0003](https://github.com/linuxfoundation/lfx-architecture-decisions/blob/main/decisions/0003-opentelemetry-instrumentation.md).

## What we use

`@opentelemetry/sdk-node` with auto-instrumentation for `http`, `pg` (Postgres), and pino. The W3C TraceContext propagator is the default — it reads incoming `traceparent` headers and injects them on outbound HTTP calls automatically. No manual context plumbing in handler code.

## OTel trace ID is the request ID

Auto-propagation makes a separate ULID-based request ID redundant: every request already has a 128-bit OTel trace ID generated at the inbound HTTP span (or honoured from an inbound `traceparent`). We use that trace ID as our request identifier:

- Error envelope `requestId` field = OTel trace ID (32-char lowercase hex). This is the customer-facing ID for support tickets — it correlates directly to logs and APM traces in Datadog without translation.
- Log lines include `trace_id` and `span_id` (OTel hex format, 128-bit and 64-bit). Datadog's APM ingester recognises OTel-format IDs natively — no parallel `dd.trace_id` / `dd.span_id` fields are emitted. A pino mixin can re-add `dd.trace_id` without contract impact if a future Datadog regression breaks UI joins.
- Inbound `traceparent` is honoured (caller's trace continues across the boundary).
- W3C `traceparent` is the sole HTTP propagation channel — honoured inbound, injected outbound automatically by the SDK. No `X-Request-Id` response header is set.

This means engineers must not introduce a parallel ULID/UUID request ID generator.

## Sampling

100% sampling in v1 — closed-alpha and silent-public traffic is low absolute volume and we want every trace for debugging. Per LFX-0003, higher-throughput services should drop the sample rate; revisit once we have RPS data on `/v1`.

## Deployment topology

The app pod runs an `opentelemetry-collector` sidecar container. The app's OTel SDK sends OTLP to the sidecar (`localhost:4317`); the collector forwards to Datadog. This follows the LFX-0003 recommendation and keeps the configuration self-contained — no changes to the shared cluster Datadog agent are needed.

In production and staging the collector exports to Datadog. Logs already flow to Datadog independently via `containerCollectAll: true` on the cluster log collector — no log routing through the OTel collector needed (per ADR-0018).

## Local development

`OTLP_EXPORTER` defaults to the stdout exporter in dev — pino logs already carry `trace_id`/`span_id`, which is enough for most local debugging. A developer wanting visual trace inspection can run a one-off Jaeger container and point the SDK at it; not mandated.
