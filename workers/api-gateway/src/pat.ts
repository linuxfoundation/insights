// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const PAT_PATTERN = /^lfi_[0-9A-Za-z]{44}$/;

export function readPat(request: Request): string | null {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization') ?? '');
  const token = match?.[1];
  return token && PAT_PATTERN.test(token) ? token : null;
}

export async function hashPat(pat: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pat));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
