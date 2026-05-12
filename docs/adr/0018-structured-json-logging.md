# Structured JSON logging via pino; log levels follow LFX-0002

The API service uses pino for structured JSON logging. Every log line is a single valid JSON object — no leading or trailing characters, no literal newlines (escaped newlines inside JSON string values are fine). Logs go to stdout (pino default). The Datadog agent DaemonSet running on each cluster node picks them up via `containerCollectAll: true` — it tails the container runtime log files and ships them to Datadog Logs automatically, with no log routing through the otel-collector sidecar. This inherits the LFX platform standard from [lfx-architecture-decisions/0002](https://github.com/linuxfoundation/lfx-architecture-decisions/blob/main/decisions/0002-structured-json-logging.md), so any future LFX service we integrate with reads logs in the same shape.

## Log levels

- **`error`** — non-recoverable failures: Tinybird or Postgres unreachable, malformed responses from those documented upstreams, our own crashes.
- **`warn`** — invalid client request payloads (validation 4xx), recoverable upstream blips, unparsable data from undocumented sources.
- **`info`** — successful mutating requests only (one line per request). **In v1 the API is read-only, so info logs should be rare** — limited to admin actions and config changes. Read endpoints MUST NOT emit info logs; doing so would blow up log volume on a high-RPS proxy.
- **`debug`** — judicious developer aid only, never function entry/exit. Use OpenTelemetry spans for execution tracing.

## Trace correlation

pino's mixin pulls the active OpenTelemetry trace context into every log line, emitting OTel-formatted `trace_id` (32-char lowercase hex, 128-bit) and `span_id` (16-char lowercase hex, 64-bit). Datadog's APM ingester recognises OTel-format IDs natively — no parallel `dd.trace_id` / `dd.span_id` fields are emitted. `trace_id` is the canonical correlation key — engineers must not invent a parallel `requestId` field for log correlation. The OTel trace ID is also the API's exposed request ID (error envelope `requestId` field); see ADR-0019.
