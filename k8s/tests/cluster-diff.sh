#!/usr/bin/env bash
set -euo pipefail

# This script compares your kustomize manifests against the live cluster
# to verify that applying them would not make any changes.
#
# Usage:
#   ./cluster-diff.sh [overlay-name]
#
# Examples:
#   ./cluster-diff.sh production
#   ./cluster-diff.sh staging
#
# Exit codes:
#   0 - No differences found (safe to apply)
#   1 - Differences found or error occurred

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
K8S_DIR="$ROOT_DIR/k8s"
OVERLAYS_DIR="$K8S_DIR/overlays"

KUBECTL_BIN=${KUBECTL:-kubectl}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ $# -eq 0 ]; then
  echo "Usage: $0 <overlay-name>"
  echo ""
  echo "Available overlays:"
  if [ -d "$OVERLAYS_DIR" ]; then
    ls -1 "$OVERLAYS_DIR"
  fi
  exit 1
fi

OVERLAY_NAME=$1
OVERLAY_PATH="$OVERLAYS_DIR/$OVERLAY_NAME"

if [ ! -d "$OVERLAY_PATH" ]; then
  echo -e "${RED}Error: Overlay '$OVERLAY_NAME' not found at $OVERLAY_PATH${NC}"
  exit 1
fi

echo "=========================================="
echo "Comparing manifests against live cluster"
echo "Overlay: $OVERLAY_NAME"
echo "=========================================="
echo ""

# Check if we can connect to the cluster
if ! $KUBECTL_BIN cluster-info &> /dev/null; then
  echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
  echo "Please ensure your kubeconfig is configured correctly"
  exit 1
fi

echo "Connected to cluster: $($KUBECTL_BIN config current-context)"
echo ""

# Run kubectl diff
echo "Running kubectl diff..."
echo ""

set +e
DIFF_OUTPUT=$($KUBECTL_BIN diff -k "$OVERLAY_PATH" 2>&1)
DIFF_EXIT_CODE=$?
set -e

# kubectl diff exit codes:
# 0 - no differences
# 1 - differences found
# >1 - error occurred

if [ $DIFF_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ No differences found!${NC}"
  echo "The manifests match what's currently deployed in the cluster."
  echo "It is safe to apply these manifests."
  exit 0
elif [ $DIFF_EXIT_CODE -eq 1 ]; then
  echo -e "${YELLOW}⚠ Differences found between manifests and cluster:${NC}"
  echo ""
  echo "$DIFF_OUTPUT"
  echo ""
  echo -e "${YELLOW}WARNING: Applying these manifests would modify the cluster!${NC}"
  exit 1
else
  echo -e "${RED}✗ Error running kubectl diff (exit code: $DIFF_EXIT_CODE)${NC}"
  echo ""
  echo "$DIFF_OUTPUT"
  exit 1
fi
