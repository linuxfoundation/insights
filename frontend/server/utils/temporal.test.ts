// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { defaultPayloadConverter } from '@temporalio/common';
import { decode } from '@temporalio/common/lib/encoding.js';
import { describe, expect, it } from 'vitest';

import { EncryptionCodec, parsePreviousEncryptionKeys } from './temporal';

const OLD_KEY = 'old-key-0123456789abcdef01234567';
const NEW_KEY = 'new-key-fedcba9876543210fedcba98';

const payload = () => defaultPayloadConverter.toPayload({ hello: 'world' });

describe('parsePreviousEncryptionKeys', () => {
  it('treats an unset value as no previous keys', () => {
    expect(parsePreviousEncryptionKeys('')).toEqual({});
    expect(parsePreviousEncryptionKeys(undefined)).toEqual({});
  });

  it('accepts a JSON string and the object Nuxt parses it into', () => {
    expect(parsePreviousEncryptionKeys(JSON.stringify({ old: OLD_KEY }))).toEqual({ old: OLD_KEY });
    expect(parsePreviousEncryptionKeys({ old: OLD_KEY })).toEqual({ old: OLD_KEY });
  });

  it('rejects malformed values without echoing them', () => {
    for (const value of [`old:${OLD_KEY}`, [OLD_KEY], { old: '' }, { old: 42 }]) {
      expect(() => parsePreviousEncryptionKeys(value)).toThrow(
        'NUXT_TEMPORAL_ENCRYPTION_KEYS_PREVIOUS must be a JSON object',
      );
      expect(() => parsePreviousEncryptionKeys(value)).not.toThrow(OLD_KEY);
    }
  });
});

describe('EncryptionCodec', () => {
  it('decrypts payloads written with a previous key and encrypts new ones with the current key', async () => {
    const [writtenBeforeRotation] = await (
      await EncryptionCodec.create('old', OLD_KEY)
    ).encode([payload()]);
    const rotated = await EncryptionCodec.create('new', NEW_KEY, { old: OLD_KEY });

    const [decrypted] = await rotated.decode([writtenBeforeRotation!]);
    const [writtenAfterRotation] = await rotated.encode([payload()]);

    expect(defaultPayloadConverter.fromPayload(decrypted!)).toEqual({ hello: 'world' });
    expect(decode(writtenAfterRotation!.metadata?.['encryption-key-id'])).toBe('new');
  });

  it('refuses a payload whose key id it does not know', async () => {
    const [writtenBeforeRotation] = await (
      await EncryptionCodec.create('old', OLD_KEY)
    ).encode([payload()]);
    const retired = await EncryptionCodec.create('new', NEW_KEY);

    await expect(retired.decode([writtenBeforeRotation!])).rejects.toThrow(
      'Unable to find key for keyId: old',
    );
  });
});
