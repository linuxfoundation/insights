// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createPrivateKey } from 'node:crypto';
import { SignJWT, importPKCS8 } from 'jose';
import { useRuntimeConfig } from '#imports';

// Accept either a base64-encoded key or the raw PEM text pasted directly (with real or
// escaped "\n" newlines) - env vars commonly end up holding either form.
// GitHub issues PKCS#1 keys ("BEGIN RSA PRIVATE KEY"); jose's importPKCS8 only accepts PKCS#8.
// node:crypto auto-detects the input format, so re-exporting as pkcs8 normalizes either one.
export function normalizePrivateKey(rawKey: string): string {
  const pem = rawKey.includes('BEGIN')
    ? rawKey.replace(/\\n/g, '\n')
    : Buffer.from(rawKey, 'base64').toString('utf8');
  return createPrivateKey(pem).export({ type: 'pkcs8', format: 'pem' }).toString();
}

// ponytail: no installation-token caching - minted per request. Installation tokens
// are valid ~1h; add an in-memory cache keyed by expiry if report volume hits rate limits.
async function getInstallationToken(): Promise<string> {
  const { githubAppId, githubAppInstallationId, githubAppPrivateKey } = useRuntimeConfig();

  if (!githubAppId || !githubAppInstallationId || !githubAppPrivateKey) {
    throw new Error('GitHub App credentials are not configured');
  }

  const pkcs8Pem = normalizePrivateKey(githubAppPrivateKey);
  const key = await importPKCS8(pkcs8Pem, 'RS256');
  const now = Math.floor(Date.now() / 1000);

  const appJwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt(now - 60) // clock-skew slack
    .setExpirationTime(now + 540) // GitHub App JWTs max out at 10 minutes
    .setIssuer(githubAppId)
    .sign(key);

  const { token } = await $fetch<{ token: string }>(
    `https://api.github.com/app/installations/${githubAppInstallationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  return token;
}

export async function createGitHubIssue(
  title: string,
  body: string,
  labels: string[] = [],
  assignees: string[] = [],
): Promise<{ html_url: string }> {
  const token = await getInstallationToken();

  const url = `https://api.github.com/repos/linuxfoundation/insights/issues`;

  return await $fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
    body: {
      title,
      body,
      labels,
      assignees,
    },
  });
}
