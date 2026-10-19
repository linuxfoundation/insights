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

// destroy() drops queued commands, which close() would wait on while Redis is unresponsive.
export async function closeRedis(): Promise<void> {
  const current = client;
  client = undefined;
  if (current?.isOpen) {
    current.destroy();
  }
}
