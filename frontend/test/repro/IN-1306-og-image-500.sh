#!/usr/bin/env bash
# Repro for IN-1306: /_og/ OG-image render errors surface as a raw HTTP 500
# instead of the intended 302 fallback redirect to /og-image.png.
#
# Root cause (see Obsidian LFX/debugging/2026-09-14-og-image-500-error-hook-race.md):
# frontend/server/plugins/og-image-fallback.ts registers an async
# nitroApp.hooks.hook('error', ...) that awaits sendRedirect(). In pinned
# nitropack@2.13.4, Nitro's onError fires the 'error' hook via
# callHookParallel WITHOUT awaiting it, then immediately sends its own
# JSON 500 response. The async redirect can never win the race in a
# production build.
#
# This script builds the app with a KNOWN NUXT_OG_IMAGE_SECRET (so we can
# forge a validly-signed OG image URL with a broken projectLogo param),
# runs the production server (`node .output/server/index.mjs` — the dev
# server's error overlay masks this bug; only prod exhibits it), forces a
# real satori render error via an unparseable projectLogo, and asserts the
# response status is 500 (bug present) vs 302 (fixed).
#
# Usage: run from the `frontend/` directory of an insights checkout.
#   TINYBIRD token/env vars must be set (see .env.dist / existing checkout's .env).

set -euo pipefail

FRONTEND_DIR="$(pwd)"
SECRET="repro-test-secret-fixed"
PORT="${PORT:-3000}"
BASE_URL="http://localhost:${PORT}"

: "${NUXT_TINYBIRD_TOKEN:?Set NUXT_TINYBIRD_TOKEN before running}"
: "${NUXT_TINYBIRD_BASE_URL:?Set NUXT_TINYBIRD_BASE_URL before running}"
: "${NUXT_JWT_SECRET:?Set NUXT_JWT_SECRET before running}"

export NUXT_OG_IMAGE_SECRET="$SECRET"
export NUXT_CM_DB_ENABLED="${NUXT_CM_DB_ENABLED:-false}"
export NUXT_PUBLIC_APP_URL="$BASE_URL"
export PORT

echo "==> Building production bundle with fixed NUXT_OG_IMAGE_SECRET"
pnpm build

echo "==> Starting production server"
node .output/server/index.mjs > /tmp/insights-og-repro-server.log 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/" || true)
  [ "$code" != "000" ] && break
  sleep 1
done

# Real page path + real project OG params (ALSA Utils), matching the
# originally reported failing request, but with projectLogo replaced by a
# value satori cannot parse as an absolute URL ("Image source must be an
# absolute URL: ..."), forcing a genuine render-time throw.
PAGE_PATH='/project/alsa-project-alsa-lib/development'
# Written into frontend/ so node module resolution (ohash) works.
HELPER="${FRONTEND_DIR}/.repro-in-1306-helper.mjs"
OHASH_CRYPTO=$(find "$(cd "${FRONTEND_DIR}/.." && pwd)/node_modules/.pnpm" -maxdepth 1 -type d -name 'ohash@*' | head -1)/node_modules/ohash/dist/crypto/node/index.mjs
if [ ! -f "$OHASH_CRYPTO" ]; then
  echo "Could not locate ohash's crypto module under node_modules/.pnpm; adjust OHASH_CRYPTO manually." >&2
  exit 3
fi
cat > "$HELPER" <<EOF
import { digest } from '${OHASH_CRYPTO}';

const [, , cmd, ...rest] = process.argv;
EOF
cat >> "$HELPER" <<'EOF'
if (cmd === 'b64') {
  process.stdout.write(Buffer.from(JSON.stringify(rest[0])).toString('base64url'));
} else if (cmd === 'b64raw') {
  process.stdout.write(Buffer.from(rest[0]).toString('base64url'));
} else if (cmd === 'sign') {
  const [secret, encoded] = rest;
  process.stdout.write(digest(`${secret}:${encoded}`).slice(0, 16));
}
EOF
trap 'kill -9 "$SERVER_PID" 2>/dev/null || true; rm -f "$HELPER"' EXIT

ENCODED_PAGE_PATH=$(node "$HELPER" b64 "$PAGE_PATH")
BAD_LOGO=$(node "$HELPER" b64raw "not a valid url ????")

ENCODED_PARAMS="c_Project,projectName_ALSA+Utils,projectDescription_The+Advanced+Linux+Sound+Architecture+(ALSA)+-+library,projectLogo_~${BAD_LOGO},p_${ENCODED_PAGE_PATH}"

SIGNATURE=$(node "$HELPER" sign "$SECRET" "$ENCODED_PARAMS")

URL="${BASE_URL}/_og/d/${ENCODED_PARAMS},s_${SIGNATURE}.png"

echo "==> Requesting: $URL"
RESPONSE=$(curl -s -i "$URL")
STATUS_LINE=$(echo "$RESPONSE" | head -1)
echo "$RESPONSE"
echo
echo "==> Status line: $STATUS_LINE"

if echo "$STATUS_LINE" | grep -q ' 500 '; then
  echo "REPRODUCED: og-image render error surfaced as HTTP 500 (bug present)"
  exit 1
elif echo "$STATUS_LINE" | grep -q ' 302 '; then
  echo "NOT REPRODUCED: got the intended 302 fallback redirect (bug fixed)"
  exit 0
else
  echo "UNEXPECTED status, inspect manually"
  exit 2
fi
