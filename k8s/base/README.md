# Insights Kubernetes Base

The `insights/k8s/base` package contains the shared Kubernetes resources for the Insights application. All environment overlays inherit from this directory to guarantee staging and production remain in sync.

## Directory Layout

- `kustomization.yaml` – root manifest listing shared resources and enforcing the `insights` namespace.
- `config/` – cluster-scoped configuration such as the namespace definition.
- `deployments/` – Deployments for the web app, Redis, and worker processes.
- `services/` – ClusterIP Services exposing shared workloads.
- `ingress/` – Ingress definitions routing traffic to the application service.

## Authoring Guidelines

1. Make changes in this base directory first. Overlays should only introduce environment-specific patches (domains, replica counts, feature flags).
2. Avoid embedding sensitive values directly in manifests; use secrets sourced from Oracle Cloud Secrets Vault.
3. Run `kubectl kustomize insights/k8s/base | kubeconform -summary` before opening a pull request. CI will enforce the same checks.
4. Document any new shared resource or convention in this README to assist other contributors.

## Validation

Use the validation harness:

```bash
./insights/k8s/tests/render-validate.sh
```

The script renders the base, validates schemas, runs policy checks, and writes overlay diffs for inspection.
