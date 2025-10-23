# Kubernetes Validation Harness

This directory hosts utilities that help keep the Insights Kubernetes configuration provably correct.

## `render-validate.sh`

Runs the full validation pipeline used locally and in CI:

1. Renders the shared base (`insights/k8s/base`) with `kubectl kustomize`.
2. Renders every environment overlay (`insights/k8s/overlays/*`) via `kubectl kustomize`.
3. Executes `kubeconform` against each rendered manifest to enforce Kubernetes schema compliance.
4. Executes `conftest` policies (when present in `insights/k8s/policies/`) to catch configuration rule violations.
5. Writes unified diffs between the base and each overlay to the system temp directory for quick inspection.

Artifacts land under `$TMPDIR/insights-k8s` (or `/tmp/insights-k8s` when `TMPDIR` is unset).

### Local Usage

```bash
./insights/k8s/tests/render-validate.sh
```

Prerequisites: `kubectl` v1.34.x (for `kubectl kustomize`), `kubeconform`, `conftest`. The script honours `KUBECTL`, `KUBECONFORM`, and `CONFTEST` environment variables if you want to override tool locations.

### CI Integration

The `.github/workflows/insights-k8s-validate.yml` workflow installs the same tooling and calls the script on every push and pull request touching `insights/k8s/**`. Validation failures block the merge until corrected.

### Troubleshooting

- **Tool not found**: export the executable path via the corresponding environment variable (`KUSTOMIZE`, `KUBECONFORM`, `CONFTEST`).
- **Schema download errors**: ensure the CI runner has outbound network access; retry locally with `kubeconform -cache` if needed.
- **Unexpected overlay diff**: review the diff files in the temp directory to confirm only intentional changes exist.
