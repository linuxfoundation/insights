# Secret Rotation Runbook (Oracle Cloud Secrets Vault → Kubernetes)

## Purpose
Ensure application configuration secrets stored in Oracle Cloud Secrets Vault are
safely synchronized into the Insights Kubernetes clusters without committing
secret material to source control.

## Prerequisites
- OCI CLI configured with permissions to read the required Vault secrets.
- kubectl v1.34.x pointing at the target cluster/context.
- jq installed (used by the helper script).

## Rotation Steps
1. Update the secret payload in Oracle Cloud Secrets Vault via console or CLI.
2. Run the helper script from repository root:
   ```bash
   ./insights/k8s/tests/secret-rotation.sh \
     --vault-secret-id <OCID_FROM_VAULT> \
     --secret-name insights-runtime \
     --namespace insights
   ```
3. The script fetches the CURRENT stage, writes `stringData` into the
   `insights-runtime` Kubernetes Secret, and restarts dependent deployments
   (`insights-app-dpl`, `package-downloads-worker-dpl`, `search-volume-worker-dpl`).
4. Verify rollout status for each deployment finishes successfully.
5. Confirm new configuration values are in effect (e.g., check application
   endpoints).

## Audit & Logging
- OCI audit logs capture secret reads; review them after rotation.
- Kubernetes events show Secret updates and rollout restarts.

## Rollback
- Re-run the script with the OCID of the previous secret version (use the OCI
  console to locate the version).
- If rollout fails, use `kubectl rollout undo deployment/<name>` for each
  affected deployment.

## Scheduled Rotations
- SecretSync CRD (`insights/k8s/secrets/mappings.yaml`) refreshes automatically
  every 15 minutes. The manual script exists for ad-hoc rotations or validation
  drills.
