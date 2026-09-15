// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { generateKeyPairSync } from 'node:crypto';
import { describe, test, expect } from 'vitest';
import { decodeJwt } from 'jose';

import { normalizePrivateKey, signAppJwt } from './github.api';

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pkcs8Pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

describe('normalizePrivateKey', () => {
  test('passes through a raw PKCS8 PEM', () => {
    expect(normalizePrivateKey(pkcs8Pem)).toEqual(pkcs8Pem);
  });

  test('normalizes a PEM with escaped newlines', () => {
    const escaped = pkcs8Pem.replace(/\n/g, '\\n');
    expect(normalizePrivateKey(escaped)).toEqual(pkcs8Pem);
  });

  test('normalizes a base64-encoded PEM', () => {
    const base64 = Buffer.from(pkcs8Pem, 'utf8').toString('base64');
    expect(normalizePrivateKey(base64)).toEqual(pkcs8Pem);
  });
});

describe('signAppJwt', () => {
  test('signs a JWT with a string "iss" claim when githubAppId is a number', async () => {
    const jwt = await signAppJwt(123456, pkcs8Pem);
    const { iss } = decodeJwt(jwt);

    expect(typeof iss).toBe('string');
    expect(iss).toBe('123456');
  });

  test('signs a JWT with a string "iss" claim when githubAppId is already a string', async () => {
    const jwt = await signAppJwt('123456', pkcs8Pem);
    const { iss } = decodeJwt(jwt);

    expect(typeof iss).toBe('string');
    expect(iss).toBe('123456');
  });
});
