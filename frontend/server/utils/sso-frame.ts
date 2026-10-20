// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { H3Event } from 'h3';

export type SsoFrameResult = 'success' | 'none';

// A background check runs in a hidden iframe, so it reports to its parent tab instead of navigating.
export function ssoFrameResponse(event: H3Event, result: SsoFrameResult): string {
  setResponseHeaders(event, {
    'cache-control': 'no-store',
    'content-type': 'text/html; charset=utf-8',
  });
  const message = JSON.stringify({ type: 'insights-sso', result });
  return `<!doctype html><meta charset="utf-8"><script>window.parent.postMessage(${message}, window.location.origin)</script>`;
}
