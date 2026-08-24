# Every request requires a valid API key; no anonymous access

All endpoints, including those that expose public project data (Endpoint Groups 1–4), require a valid API key. There is no unauthenticated access path. A missing or invalid key returns 401 immediately. We chose the auth-floor approach because: (1) rate limiting and abuse prevention require a stable identity to enforce per-org quotas; (2) attribution (knowing which orgs use which endpoints) is essential for prioritizing the roadmap and justifying infrastructure cost; (3) anonymous access complicates the future tier-gating mechanism. The cost is a higher onboarding barrier (users must create an API key before their first request). This can be revisited if adoption data shows the friction is significant.

## Scope

The key requirement applies to customer data routes: everything under `/v1/...` and `/v1-alpha/...`. Three non-data surfaces are exempt:

- `/health/live` and `/health/ready`: Kubernetes probes cannot carry a customer credential, and pod health must not depend on the Worker/Auth0 path. Restricted at the network layer (cluster-internal), not by API key.
- `/docs`: public documentation. Requiring a key to read how to get a key defeats onboarding. Gated (not publicly indexable) until launch per E5, but not key-authenticated.
- `/v1/openapi.json`: the machine-readable spec the docs and tooling consume.

The auth hook is scoped to the versioned data routes rather than registered globally, so these exemptions are structural, not per-route opt-outs.
