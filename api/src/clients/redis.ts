// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { createClient } from '@redis/client';
import type { FastifyBaseLogger } from 'fastify';

import { requiredEnv } from '../env.js';

export const redisEnv = ['API_REDIS_URL'] as const;

const newClient = (url: string) =>
  createClient({ url, socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 3000) } });

export type RedisClient = ReturnType<typeof newClient>;

let client: RedisClient | undefined;

// Built on first use, so importing this module never needs API_REDIS_URL. The client logs its own
// connection errors and keeps reconnecting.
export function getRedisClient(log: FastifyBaseLogger): RedisClient {
  if (!client) {
    const created = newClient(requiredEnv('API_REDIS_URL'));
    created.on('error', (err: unknown) => log.error({ err }, 'Redis client error'));
    created.connect().catch(() => {});
    client = created;
  }
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    dropRedisClient(client);
  }
}

// destroy() drops queued commands, which close() would wait on while Redis is unresponsive. A newer
// client that already replaced `stale` stays in use.
export function dropRedisClient(stale: RedisClient): void {
  if (client === stale) {
    client = undefined;
  }
  if (stale.isOpen) {
    stale.destroy();
  }
}

// The timed-out work keeps running, so onTimeout is where the caller abandons it.
export async function withTimeout<T>(
  work: Promise<T>,
  ms: number,
  onTimeout: () => void,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Redis did not answer within ${ms} ms`));
      onTimeout();
    }, ms);
  });
  try {
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
}
