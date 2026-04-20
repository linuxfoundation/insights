#!/usr/bin/env bash
# Copyright (c) 2025 The Linux Foundation and each contributor.
# SPDX-License-Identifier: MIT
#
# Filter Tinybird logs from production pods during/after a stress test.
# Usage: ./log-filter.sh [--since=<duration>]   default: 10m

SINCE="${1:-10m}"
LABEL="app=insights-app"
NAMESPACE="insights"
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

kubectl logs -n "$NAMESPACE" -l "$LABEL" --since="$SINCE" --prefix=false --tail=-1 2>/dev/null > "$TMPFILE"

echo "=== Queue saturation (tinybird_queue_status) ==="
grep '"tinybird_queue_status"' "$TMPFILE" \
  | jq -r '[.active, .queued, .effectiveLimit, .timestamp] | @tsv' \
  | sort -t$'\t' -k2 -rn | head -20

echo ""
echo "=== Slow requests >5s (tinybird_slow_request) ==="
grep '"tinybird_slow_request"' "$TMPFILE" \
  | jq -r '[.pipe, .durationMs, .active, .queued] | @tsv' \
  | sort -t$'\t' -k2 -rn | head -20

echo ""
echo "=== Errors (tinybird_request_error) ==="
grep '"tinybird_request_error"' "$TMPFILE" \
  | jq -r '[.pipe, .durationMs, .status, .active, .queued] | @tsv' \
  | sort -t$'\t' -k2 -rn | head -20

echo ""
echo "=== Adaptive throttle events ==="
grep '"tinybird_adaptive_throttle"' "$TMPFILE" \
  | jq -r '[.event, .previousLimit, .newLimit, .active, .queued, .timestamp] | @tsv'
