// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { createClient, RedisClientType } from '@redis/client';

/**
 * Memoized Redis client instance
 */
let redisClient: RedisClientType | null = null;

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
  if (redisClient) {
    return redisClient;
  }

  // Set the database number in the URL, replacing an existing one if present.
  const url = setRedisDatabase(redisUrl, database);

  redisClient = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        // Timeout at 3000ms
        return Math.min(retries * 50, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await redisClient.connect();

  // Wait for a ready state if requested
  if (enableReadyCheck && !redisClient.isReady) {
    await new Promise<void>((resolve) => {
      redisClient!.on('ready', () => resolve());
    });
  }

  return redisClient;
}

/**
 * Closes the Redis client connection. Useful for clean-up in tests or shutdown.
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
