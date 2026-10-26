# Datadog

Dashboard and monitor definitions for the public API, kept here so changes go through review. Datadog does not read this folder: import a file by hand after it merges, and export it back here when you change it in Datadog. Changes here do not redeploy the API.

## Dashboard

`dashboard.json` is the "Insights API" dashboard. Import it from Dashboards > New Dashboard > Import dashboard JSON, or update the existing one from its settings menu > Import dashboard JSON.

- Overview, Endpoints: APM trace metrics for `fastify.request`, so latency percentiles and 5xx rates per endpoint cost no custom metrics.
- Tiers, Tinybird, Auth and Postgres: the `insights.api.*` DogStatsD metrics (see the Telemetry section of `api/README.md`).
- Callers: span queries grouped by `@usr.id`. Datadog keeps a sample of spans, so add a retention filter that keeps every `service:insights-api` span for exact per-caller counts.
