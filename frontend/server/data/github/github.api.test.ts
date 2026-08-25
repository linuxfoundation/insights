// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { generateKeyPairSync } from 'node:crypto';
import { describe, test, expect } from 'vitest';

import { normalizePrivateKey } from './github.api';

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
