// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { webcrypto as crypto } from 'node:crypto';
import { Client, Connection } from '@temporalio/client';
import type { DataConverter, Payload, PayloadCodec } from '@temporalio/common';
import { METADATA_ENCODING_KEY } from '@temporalio/common';
import { decode, encode } from '@temporalio/common/lib/encoding';
import proto from '@temporalio/proto';
import { isLocal } from './common';

const { temporal } = proto;

const ENCODING = 'binary/encrypted';
const METADATA_ENCRYPTION_KEY_ID = 'encryption-key-id';
const CIPHER = 'AES-GCM';
const IV_LENGTH_BYTES = 12;
const TAG_LENGTH_BYTES = 16;

async function encrypt(data: Uint8Array, key: crypto.CryptoKey): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: CIPHER,
      iv,
      tagLength: TAG_LENGTH_BYTES * 8,
    },
    key,
    data,
  );

  return Buffer.concat([iv, new Uint8Array(encrypted)]) as unknown as Uint8Array;
}

async function decrypt(encryptedData: Uint8Array, key: crypto.CryptoKey): Promise<Uint8Array> {
  const iv = encryptedData.subarray(0, IV_LENGTH_BYTES);
  const ciphertext = encryptedData.subarray(IV_LENGTH_BYTES);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: CIPHER,
      iv,
      tagLength: TAG_LENGTH_BYTES * 8,
    },
    key,
    ciphertext,
  );

  return new Uint8Array(decrypted);
}

async function fetchKey(encryptionKey: string): Promise<crypto.CryptoKey> {
  const key = Buffer.from(encryptionKey);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    {
      name: 'AES-GCM',
    },
    true,
    ['encrypt', 'decrypt'],
  );

  return cryptoKey;
}

class EncryptionCodec implements PayloadCodec {
  constructor(
    protected readonly keys: Map<string, crypto.CryptoKey>,
    protected readonly defaultKeyId: string,
  ) {}

  static async create(keyId: string, encryptionKey: string): Promise<EncryptionCodec> {
    const keys = new Map<string, crypto.CryptoKey>();
    keys.set(keyId, await fetchKey(encryptionKey));
    return new EncryptionCodec(keys, keyId);
  }

  async encode(payloads: Payload[]): Promise<Payload[]> {
    return Promise.all(
      payloads.map(async (payload) => ({
        metadata: {
          [METADATA_ENCODING_KEY]: encode(ENCODING),
          [METADATA_ENCRYPTION_KEY_ID]: encode(this.defaultKeyId),
        },
        data: await encrypt(
          temporal.api.common.v1.Payload.encode(payload).finish(),
          this.keys.get(this.defaultKeyId)!,
        ),
      })),
    );
  }

  async decode(payloads: Payload[]): Promise<Payload[]> {
    return Promise.all(
      payloads.map(async (payload) => {
        if (!payload.metadata || decode(payload.metadata[METADATA_ENCODING_KEY]) !== ENCODING) {
          return payload;
        }
        if (!payload.data) {
          throw new Error('Payload data is missing');
        }

        const keyIdBytes = payload.metadata[METADATA_ENCRYPTION_KEY_ID];
        if (!keyIdBytes) {
          throw new Error('Unable to decrypt Payload without encryption key id');
        }

        const keyId = decode(keyIdBytes);
        const key = this.keys.get(keyId);
        if (!key) {
          throw new Error(`Unable to find key for keyId: ${keyId}`);
        }
        const decryptedPayloadBytes = await decrypt(payload.data, key);
        return temporal.api.common.v1.Payload.decode(decryptedPayloadBytes);
      }),
    );
  }
}

async function createDataConverter(
  keyId: string,
  encryptionKey: string,
): Promise<DataConverter | undefined> {
  if (!encryptionKey) {
    return undefined;
  }
  return {
    payloadCodecs: [await EncryptionCodec.create(keyId, encryptionKey)],
  };
}

let temporalClient: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (temporalClient) {
    return temporalClient;
  }

  const config = useRuntimeConfig();

  const connection = await Connection.connect({
    address: config.temporalServerUrl,
    tls:
      config.temporalCertificate && config.temporalPrivateKey
        ? {
            clientCertPair: {
              crt: Buffer.from(config.temporalCertificate, 'base64'),
              key: Buffer.from(config.temporalPrivateKey, 'base64'),
            },
          }
        : undefined,
  });

  const dataConverter = isLocal
    ? undefined
    : await createDataConverter(config.temporalEncryptionKeyId, config.temporalEncryptionKey);

  temporalClient = new Client({
    connection,
    namespace: config.temporalNamespace,
    identity: 'lfx-insights-frontend',
    dataConverter,
  });

  return temporalClient;
}

export const SECURITY_BEST_PRACTICES_TASK_QUEUE = 'security-best-practices';
export const UPSERT_OSPS_BASELINE_WORKFLOW = 'upsertOSPSBaselineSecurityInsights';

export interface IUpsertOSPSBaselineSecurityInsightsParams {
  insightsProjectId: string;
  insightsProjectSlug: string;
  repoUrl: string;
  token: string;
}
