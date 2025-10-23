# Kubernetes Migration Prerequisites & Tooling Checklist

This checklist captures the pre-flight requirements for consolidating Insights Kubernetes manifests into the `insights/k8s` tree and enabling Kustomize-driven deployments.

## Access & Credentials

- [ ] OCI tenancy access with permissions to read Oracle Secrets Vault entries for staging and production environments.
- [ ] kubectl contexts configured for `insights-staging` and `insights-production` clusters (verify via `kubectl config get-contexts`).
- [ ] GitHub access tokens with rights to push branches and update CI workflows in this repository.
- [ ] Crowd-kube repository checked out for reference to existing manifests and scripts.

## Tooling Baseline

- [ ] `kustomize` v5.x installed locally and in CI runner images.
- [ ] `kubectl` v1.34.x available for local validation and automated pipelines (built-in `-k`/`kustomize` support).
- [ ] `kubeconform` installed for schema validation of rendered manifests.
- [ ] `conftest` (OPA) installed with policy bundle for manifest compliance checks.
- [ ] `oci` CLI configured for secret verification workflows.

## Environment Snapshots & References

- [ ] Production manifest snapshot captured at `insights/k8s/reference/production-manifests.yaml`.
- [ ] Staging manifest snapshot (if needed) captured for regression comparison.
- [ ] Existing `.env.enc` secret references documented with corresponding Oracle Vault secret OCIDs.

## Pipeline & Observability

- [ ] GitHub Actions runner images updated to include required tooling versions.
- [ ] Observability dashboards prepared to ingest render/deploy duration metrics from the new validation pipeline.
- [ ] Alerting thresholds agreed (render + validation <2 minutes; full deploy <=30 minutes; secret sync overhead <1 minute).

## Approvals & Communication

- [ ] Platform maintainers sign off on migration plan and cutover timeline.
- [ ] Security team acknowledges secrets-handling changes and audit requirements.
- [ ] Release management informed about temporary deployment freeze during final cutover window.

Mark each item as completed before beginning the foundational implementation phase.
