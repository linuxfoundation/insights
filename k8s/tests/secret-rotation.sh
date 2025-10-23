#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $0 --vault-secret-id <ocid> --secret-name <k8s-secret> [--namespace insights]

Fetches the latest value from Oracle Cloud Secrets Vault (expected to be a JSON
object of key/value pairs) and updates the corresponding Kubernetes Secret, then
restarts dependent Deployments so the new value takes effect. Requires OCI CLI
authenticated with read access and kubectl configured for the target cluster.
USAGE
}

NAMESPACE="insights"
VAULT_SECRET_ID=""
SECRET_NAME="insights-runtime"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vault-secret-id)
      VAULT_SECRET_ID="$2"
      shift 2
      ;;
    --secret-name)
      SECRET_NAME="$2"
      shift 2
      ;;
    --namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$VAULT_SECRET_ID" ]]; then
  echo "Error: --vault-secret-id is required" >&2
  usage
  exit 1
fi

echo "Fetching secret bundle $VAULT_SECRET_ID from OCI"
SECRET_PAYLOAD=$(oci secrets secret-bundle get --secret-id "$VAULT_SECRET_ID" \
  --stage CURRENT \
  --query "data.'secret-bundle-content'.content" --raw-output)

if [[ -z "$SECRET_PAYLOAD" ]]; then
  echo "Error: received empty payload from OCI" >&2
  exit 1
fi

echo "Decoding secret payload"
SECRET_JSON=$(printf '%s' "$SECRET_PAYLOAD" | base64 --decode)
KEY_VALUES=$(printf '%s' "$SECRET_JSON" | jq -r 'to_entries[] | "\(.key)=\(.value)"')

if [[ -z "$KEY_VALUES" ]]; then
  echo "Error: secret JSON did not contain key/value pairs" >&2
  exit 1
fi

TMP_FILE=$(mktemp)
trap 'rm -f "$TMP_FILE"' EXIT

{
  echo "apiVersion: v1"
  echo "kind: Secret"
  echo "metadata:"
  echo "  name: $SECRET_NAME"
  echo "  namespace: $NAMESPACE"
  echo "stringData:"
  while IFS='=' read -r KEY VALUE; do
    printf '  %s: |\n' "$KEY"
    printf '%s' "$VALUE" | sed 's/^/    /'
    echo
  done <<< "$KEY_VALUES"
} > "$TMP_FILE"

echo "Applying Kubernetes Secret $SECRET_NAME"
kubectl apply -f "$TMP_FILE"

echo "Restarting dependent Deployments"
for deploy in insights-app-dpl package-downloads-worker-dpl search-volume-worker-dpl; do
  kubectl -n "$NAMESPACE" rollout restart deployment "$deploy" || true
  kubectl -n "$NAMESPACE" rollout status deployment "$deploy" --timeout=120s || true
done

echo "Secret rotation script completed successfully."
