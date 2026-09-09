// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface TinybirdResponse<T> {
  data: T;
  meta: {
    name: string;
    type: string;
  }[];
  rows: number;
  rows_before_limit_at_least?: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

/** Scalar or array values accepted in a Tinybird query. No framework types (e.g. no Luxon DateTime). */
export type TinybirdQueryValue = string | number | boolean | string[] | number[] | undefined | null;

export type TinybirdQuery = Record<string, TinybirdQueryValue>;

export interface TinybirdLogger {
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Minimal storage interface for the bucket-ID cache.
 * Implementors can wrap Redis, an in-memory map, or anything else.
 */
export interface BucketCacheStorage {
  getItem(key: string): Promise<number | null | undefined>;
  setItem(key: string, value: number, options?: { ttl?: number }): Promise<void>;
  removeItem(key: string): Promise<void>;
  getKeys(prefix: string): Promise<string[]>;
}

export interface TinybirdClientConfig {
  /** Defaults to https://api.us-west-2.aws.tinybird.co */
  baseUrl?: string;
  token: string;
  maxConcurrent?: number;
  maxQueueSize?: number;
  queueTimeoutMs?: number;
  slowRequestThresholdMs?: number;
  /** Optional persistent cache for project → bucketId lookups. Omit to always fetch fresh. */
  bucketCache?: BucketCacheStorage;
  /** Defaults to console */
  logger?: TinybirdLogger;
}

export interface TinybirdClient {
  fetch<T>(path: string, query: TinybirdQuery): Promise<TinybirdResponse<T>>;
  post<T>(path: string, params: TinybirdQuery): Promise<TinybirdResponse<T>>;
  ingest(datasource: string, data: object): Promise<boolean>;
  getBucketIdForProject(project: string): Promise<number | null>;
  clearBucketCache(project: string): Promise<void>;
  clearAllBucketCaches(): Promise<void>;
}
