#!/usr/bin/env bash
# Copyright (c) 2025 The Linux Foundation and each contributor.
# SPDX-License-Identifier: MIT
#
# Guard hook: warns when editing protected infrastructure files.
# Used by Claude Code PreToolUse hook on Edit and Write operations.
# Exit code 0 = allow (with warning message printed to stderr).

set -euo pipefail

# Read tool input from stdin (JSON with file_path field)
INPUT=$(cat)

# Extract file_path from the JSON input
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//' || true)

# If no file_path found, allow the operation
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Normalize: strip leading ./ if present
FILE_PATH="${FILE_PATH#./}"

# Also handle absolute paths by stripping the repo root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -n "$REPO_ROOT" ] && [[ "$FILE_PATH" == "$REPO_ROOT"/* ]]; then
  FILE_PATH="${FILE_PATH#$REPO_ROOT/}"
fi

# Helper: warn about a protected file (allows the edit to proceed)
warn() {
  local reason="$1"
  echo "" >&2
  echo "⚠ WARNING: This file is part of the project's core infrastructure." >&2
  echo "File: $FILE_PATH" >&2
  echo "Reason: $reason" >&2
  echo "Ensure this change is intentional and reviewed by a code owner." >&2
  echo "" >&2
  exit 0
}

# ── Nuxt & App Config ──────────────────────────────────────────
case "$FILE_PATH" in
  frontend/nuxt.config.ts)
    warn "Main Nuxt configuration — changes affect the entire application." ;;
  frontend/setup/modules.ts)
    warn "Nuxt modules registration — changes affect all installed modules." ;;
  frontend/setup/vite.ts)
    warn "Vite bundler config — changes affect build output and dev server." ;;
  frontend/setup/runtime-config.ts)
    warn "Runtime environment config — changes affect all environment variables exposed to the app." ;;
  frontend/setup/primevue.ts)
    warn "PrimeVue theming config — changes affect the entire UI component library." ;;
esac

# ── Server Infrastructure ──────────────────────────────────────
if [[ "$FILE_PATH" == frontend/server/middleware/* ]]; then
  warn "Server middleware — changes affect request processing for all API routes."
fi

# ── Auth & Plugins ─────────────────────────────────────────────
case "$FILE_PATH" in
  frontend/app/plugins/auth.client.ts)
    warn "Auth0 client plugin — changes affect authentication across the entire app." ;;
  frontend/app/plugins/vue-query.ts)
    warn "TanStack Query plugin — changes affect all data fetching and caching." ;;
  frontend/server/middleware/jwt-auth.ts)
    warn "JWT auth middleware — changes affect the API route authentication allowlist." ;;
esac

if [[ "$FILE_PATH" == frontend/server/plugins/* ]]; then
  warn "Server plugin — changes affect server startup and request lifecycle."
fi

# ── Build & Config Files ───────────────────────────────────────
if [[ "$FILE_PATH" == .husky/* ]]; then
  warn "Git hooks — changes affect pre-commit validation for all contributors."
fi

case "$FILE_PATH" in
  eslint.config.*|frontend/eslint.config.*)
    warn "ESLint configuration — changes affect code quality rules for the project." ;;
  .prettierrc*|frontend/.prettierrc*)
    warn "Prettier configuration — changes affect code formatting standards." ;;
  CLAUDE.md)
    warn "Project instructions — changes affect AI assistant behavior for all users." ;;
  .claude/settings.json)
    warn "Claude Code settings — changes affect permissions and hooks for all users." ;;
  scripts/add-license.js|scripts/add-license-all-files.js|scripts/check-license.js)
    warn "License script — changes affect license header compliance validation." ;;
  COPYRIGHT_HEADER.txt|COPYRIGHT_HEADER_vue.txt)
    warn "License header template — changes affect headers added to all new source files." ;;
esac

# ── Package Files ──────────────────────────────────────────────
if [[ "$FILE_PATH" == package.json ]] || [[ "$FILE_PATH" == frontend/package.json ]]; then
  warn "Package manifest — changes affect dependencies and scripts for the project."
fi
if [[ "$FILE_PATH" == pnpm-lock.yaml ]]; then
  warn "Lock file — changes affect resolved dependency versions for all contributors."
fi

# If none of the protected patterns matched, allow the operation
exit 0
