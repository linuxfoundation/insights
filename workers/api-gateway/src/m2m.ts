// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Env } from './env';

const EXPIRY_MARGIN_MS = 60_000;

let cached: { token: string; expiresAt: number } | undefined;

export async function m2mToken(env: Env): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const response = await fetch(new URL('oauth/token', env.M2M_ISSUER_URL), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: env.M2M_CLIENT_ID,
      client_secret: env.M2M_CLIENT_SECRET,
      audience: env.M2M_AUDIENCE,
    }),
  });
  if (!response.ok) throw new Error(`M2M token request failed: ${response.status}`);

  const body = (await response.json()) as { access_token: string; expires_in: number };
  cached = {
    token: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000 - EXPIRY_MARGIN_MS,
  };
  return cached.token;
}
