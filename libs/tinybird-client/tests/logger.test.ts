// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';

import { consoleLogger } from '../src/logger.js';

describe('consoleLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prints an event as one JSON line with the message first', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    consoleLogger.warn('tinybird_slow_request', { pipe: '/v0/pipes/x.json', durationMs: 6000 });

    expect(warn).toHaveBeenCalledWith(
      '{"message":"tinybird_slow_request","pipe":"/v0/pipes/x.json","durationMs":6000}',
    );
  });

  it('leaves undefined fields out of the line', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    consoleLogger.error('tinybird_request_error', { pipe: '/v0/pipes/x.json', status: undefined });

    expect(error).toHaveBeenCalledWith(
      '{"message":"tinybird_request_error","pipe":"/v0/pipes/x.json"}',
    );
  });

  it('prints a free-text line as it is', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    consoleLogger.warn('Failed to fetch bucketId for project k8s: boom');

    expect(warn).toHaveBeenCalledWith('Failed to fetch bucketId for project k8s: boom');
  });
});
