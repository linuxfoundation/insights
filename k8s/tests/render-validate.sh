#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
K8S_DIR="$ROOT_DIR/k8s"
BASE_DIR="$K8S_DIR/base"
OVERLAYS_DIR="$K8S_DIR/overlays"
TMP_DIR=${TMPDIR:-/tmp}/insights-k8s

mkdir -p "$TMP_DIR"

KUBECTL_BIN=${KUBECTL:-kubectl}
KUBECONFORM_BIN=${KUBECONFORM:-kubeconform}
CONFTEST_BIN=${CONFTEST:-conftest}
POLICY_DIR=${POLICY_DIR:-"$K8S_DIR/policies"}

run_render() {
  local target=$1
  local output=$2
  echo "Rendering manifests for $target"
  $KUBECTL_BIN kustomize "$target" > "$output"
}

run_kubeconform() {
  local manifest=$1
  echo "Validating schemas with kubeconform for $manifest"
  $KUBECONFORM_BIN -summary -ignore-missing-schemas < "$manifest"
}

run_conftest() {
  local target=$1
  if [ -d "$POLICY_DIR" ]; then
    echo "Running conftest policies for $target"
    $CONFTEST_BIN test "$target" --policy "$POLICY_DIR"
  else
    echo "No policy directory found at $POLICY_DIR; skipping conftest"
  fi
}

BASE_MANIFEST="$TMP_DIR/base.yaml"
run_render "$BASE_DIR" "$BASE_MANIFEST"
run_kubeconform "$BASE_MANIFEST"
run_conftest "$BASE_DIR"

declare -a overlays
if [ -d "$OVERLAYS_DIR" ]; then
  while IFS= read -r -d '' overlay; do
    overlays+=("$overlay")
  done < <(find "$OVERLAYS_DIR" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
fi

for overlay in "${overlays[@]:-}"; do
  name=$(basename "$overlay")
  overlay_manifest="$TMP_DIR/${name}.yaml"
  run_render "$overlay" "$overlay_manifest"
  run_kubeconform "$overlay_manifest"
  run_conftest "$overlay"
  diff --unified "$BASE_MANIFEST" "$overlay_manifest" > "$TMP_DIR/${name}.diff" || true
  echo "Overlay diff written to $TMP_DIR/${name}.diff"
done

echo "Render & validation complete. Artifacts stored in $TMP_DIR."
