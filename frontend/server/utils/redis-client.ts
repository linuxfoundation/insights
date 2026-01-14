// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createClient, RedisClientType } from '@redis/client';

/**
 * Memoized Redis client instances keyed by Redis URL + database.
 */
const redisClients = new Map<string, RedisClientType>();

/**
 * Sets or replaces the database number in a Redis URL. This is useful because we use Redis for
 * multiple purposes, so we need to be careful not to overwrite data in an existing database.
 *
 * Examples:
 * setRedisDatabase('redis://localhost:6379', 1) => 'redis://localhost:6379/1'
 * setRedisDatabase('redis://localhost:6379/0', 2) => 'redis://localhost:6379/2'
 *
 * @param url - Redis URL (e.g., redis://localhost:6379 or redis://localhost:6379/0)
 * @param database - Database number to use
 * @returns URL with the specified database number
 */
function setRedisDatabase(url: string, database: number): string {
  const urlObj = new URL(url);
  // Remove leading slash and any existing database number from pathname
  urlObj.pathname = `/${database}`;
  return urlObj.toString();
}

async function waitForClientReady(client: RedisClientType) {
  if (client.isReady) {
    return;
  }

  await new Promise<void>((resolve) => {
    client.once('ready', () => resolve());
  });
}

/**
 * Creates and returns a Redis client instance. The client is memoized so subsequent calls
 * return the same instance.
 *
 * @param redisUrl - Redis connection URL from runtime config
 * @param database - Database number to use
 * @param enableReadyCheck - If true, waits for the client to be ready before returning
 * @returns Redis client instance
 */
export async function getRedisClient(
  redisUrl: string,
  database: number,
  enableReadyCheck = true,
): Promise<RedisClientType> {
  const url = setRedisDatabase(redisUrl, database);
  const key = url;

  const memoizedClient = redisClients.get(key);
  if (memoizedClient) {
    if (enableReadyCheck && !memoizedClient.isReady) {
      await waitForClientReady(memoizedClient);
    }

    return memoizedClient;
  }

  const client = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        // Timeout at 3000ms
        return Math.min(retries * 50, 3000);
      },
    },
  });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  redisClients.set(key, client);

  try {
    await client.connect();

    if (enableReadyCheck && !client.isReady) {
      await waitForClientReady(client);
    }
  } catch (error) {
    redisClients.delete(key);
    throw error;
  }

  return client;
}

/**
 * Closes the Redis client connection. Useful for clean-up in tests or shutdown.
 */
export async function closeRedisClient(redisUrl: string, database: number): Promise<void> {
  const key = setRedisDatabase(redisUrl, database);
  const client = redisClients.get(key);

  if (!client) {
    return;
  }

  await client.quit();
  redisClients.delete(key);
}
