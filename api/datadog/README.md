# Datadog

Dashboard and monitor definitions for the public API, kept here so changes go through review. Datadog does not read this folder: import a file by hand after it merges, and export it back here when you change it in Datadog. Changes here do not redeploy the API.

## Dashboard

`dashboard.json` is the "Insights API" dashboard. Import it from Dashboards > New Dashboard > Import dashboard JSON, or update the existing one from its settings menu > Import dashboard JSON.

- Overview, Endpoints: APM trace metrics for `fastify.request`, so latency percentiles and 5xx rates per endpoint cost no custom metrics.
- Tiers, Tinybird, Auth and Postgres: the `insights.api.*` DogStatsD metrics (see the Telemetry section of `api/README.md`).
- Callers: span queries grouped by `@usr.id`. Datadog keeps a sample of spans, so add a retention filter that keeps every `service:insights-api` span for exact per-caller counts.

## Monitors

Each file in `monitors/` is one monitor. Import it from Monitors > New Monitor > Import from JSON, or update an existing one from its settings menu > Export/Import. They notify `@slack-insights-critical-alerts`.

| File                         | Alerts when                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `5xx-rate.json`              | over 5% of requests answer 5xx in 10 minutes (warning at 2%)  |
| `tinybird-failure-rate.json` | over 10% of Tinybird calls fail in 10 minutes (warning at 5%) |
| `auth-failure-spike.json`    | over 50 auth failures in 5 minutes (warning at 10)            |
| `rate-limit-spike.json`      | over 500 rate-limit rejections in 5 minutes (warning at 100)  |

The thresholds are starting points to tune once there is traffic to compare against. At low traffic a single failed request moves the rates a lot. Latency monitors wait until the latency baseline is known.
