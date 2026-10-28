// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { afterEach, describe, expect, it, vi } from 'vitest';

import { consoleLogger, createConsoleLogger } from '../src/logger.js';
import type { TinybirdLogLevel } from '../src/types.js';

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

describe('createConsoleLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const spies = () => ({
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  });

  it('prints from info up by default', () => {
    const out = spies();
    const logger = createConsoleLogger();

    logger.debug('tinybird_queue_status', { active: 1 });
    logger.info('tinybird_adaptive_throttle', { event: 'recovery' });

    expect(out.debug).not.toHaveBeenCalled();
    expect(out.info).toHaveBeenCalledOnce();
  });

  it('prints debug lines at debug level', () => {
    const out = spies();

    createConsoleLogger('debug').debug('tinybird_queue_status', { active: 1 });

    expect(out.debug).toHaveBeenCalledWith('{"message":"tinybird_queue_status","active":1}');
  });

  it('prints only warnings and errors at warn level', () => {
    const out = spies();
    const logger = createConsoleLogger('warn');

    logger.info('tinybird_adaptive_throttle', { event: 'recovery' });
    logger.warn('tinybird_slow_request', { durationMs: 6000 });

    expect(out.info).not.toHaveBeenCalled();
    expect(out.warn).toHaveBeenCalledOnce();
  });

  it('falls back to info for an unknown level', () => {
    const out = spies();
    const logger = createConsoleLogger('verbose' as TinybirdLogLevel);

    logger.debug('tinybird_queue_status', { active: 1 });
    logger.info('tinybird_adaptive_throttle', { event: 'recovery' });

    expect(out.debug).not.toHaveBeenCalled();
    expect(out.info).toHaveBeenCalledOnce();
  });
});
