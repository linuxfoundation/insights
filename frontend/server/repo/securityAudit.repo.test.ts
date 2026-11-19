// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { Pool } from 'pg';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  AUDIT_FIELD_LIMITS,
  AuditWriteLimiter,
  SecurityAuditRepository,
} from './securityAudit.repo';

const MINUTE = 60_000;

const huge = (size = 5 * 1024 * 1024) => 'a'.repeat(size);

function createPool() {
  const query = vi.fn(async () => ({ rows: [], rowCount: 0 }));
  return { pool: { query } as unknown as Pool, query };
}

const insertCalls = (query: ReturnType<typeof vi.fn>) =>
  query.mock.calls.filter(([sql]) => String(sql).includes('INSERT INTO security_audit_logs'));

describe('SecurityAuditRepository', () => {
  let now: number;
  const clock = () => now;

  beforeEach(() => {
    now = Date.UTC(2026, 10, 19);
  });

  it('caps every stored string at a fixed length whatever the caller passes', async () => {
    const { pool, query } = createPool();
    const repo = new SecurityAuditRepository(pool, new AuditWriteLimiter(), clock);

    await repo.logSecurityEvent({
      eventType: 'invalid_redirect',
      endpoint: huge(),
      ipAddress: huge(),
      userAgent: huge(),
      attemptedValue: huge(),
      details: { blob: huge() },
    });

    const [[, params]] = insertCalls(query);
    const [, endpoint, ip, userAgent, attemptedValue, details] = params as string[];
    expect(endpoint).toHaveLength(AUDIT_FIELD_LIMITS.endpoint);
    expect(ip).toHaveLength(AUDIT_FIELD_LIMITS.ipAddress);
    expect(userAgent).toHaveLength(AUDIT_FIELD_LIMITS.userAgent);
    expect(attemptedValue).toHaveLength(AUDIT_FIELD_LIMITS.attemptedValue);
    expect(details.length).toBeLessThanOrEqual(AUDIT_FIELD_LIMITS.details);
    expect(() => JSON.parse(details)).not.toThrow();
  });

  it('caps details by UTF-8 bytes, not characters', async () => {
    const { pool, query } = createPool();
    const repo = new SecurityAuditRepository(pool, new AuditWriteLimiter(), clock);

    // 600 three-byte characters: under 1024 characters but about 1.8 KB.
    await repo.logSecurityEvent({
      eventType: 'invalid_redirect',
      endpoint: '/api/auth/login',
      details: { blob: '漢'.repeat(600) },
    });

    const [[, params]] = insertCalls(query);
    const details = (params as string[])[5]!;
    expect(Buffer.byteLength(details, 'utf8')).toBeLessThanOrEqual(AUDIT_FIELD_LIMITS.details);
  });

  it('keeps short values unchanged', async () => {
    const { pool, query } = createPool();
    const repo = new SecurityAuditRepository(pool, new AuditWriteLimiter(), clock);

    await repo.logInvalidRedirect('/api/auth/login', 'https://evil.example', '1.2.3.4', 'curl/8');

    const [[, params]] = insertCalls(query);
    expect(params).toEqual([
      'invalid_redirect',
      '/api/auth/login',
      '1.2.3.4',
      'curl/8',
      'https://evil.example',
      null,
    ]);
  });

  it('limits writes per client across all endpoints within a window', async () => {
    const { pool, query } = createPool();
    const limiter = new AuditWriteLimiter({ perClient: 3, global: 100, windowMs: MINUTE });
    const repo = new SecurityAuditRepository(pool, limiter, clock);

    const endpoints = ['/api/auth/login', '/api/auth/callback', '/api/auth/logout'];
    for (let i = 0; i < 30; i++) {
      await repo.logInvalidRedirect(endpoints[i % 3]!, `x${i}`, '1.2.3.4', 'ua');
    }

    expect(insertCalls(query)).toHaveLength(3);
  });

  it('limits total writes per window across many clients', async () => {
    const { pool, query } = createPool();
    const limiter = new AuditWriteLimiter({ perClient: 3, global: 10, windowMs: MINUTE });
    const repo = new SecurityAuditRepository(pool, limiter, clock);

    for (let i = 0; i < 500; i++) {
      await repo.logInvalidRedirect('/api/auth/login', 'x', `10.0.${i >> 8}.${i & 255}`, 'ua');
    }

    expect(insertCalls(query)).toHaveLength(10);
  });

  it('allows writes again once the window has passed', async () => {
    const { pool, query } = createPool();
    const limiter = new AuditWriteLimiter({ perClient: 1, global: 10, windowMs: MINUTE });
    const repo = new SecurityAuditRepository(pool, limiter, clock);

    await repo.logInvalidRedirect('/api/auth/login', 'x', '1.2.3.4');
    await repo.logInvalidRedirect('/api/auth/login', 'x', '1.2.3.4');
    now += MINUTE;
    await repo.logInvalidRedirect('/api/auth/login', 'x', '1.2.3.4');

    expect(insertCalls(query)).toHaveLength(2);
  });

  it('does not throw when the database fails', async () => {
    const pool = { query: vi.fn(async () => Promise.reject(new Error('down'))) } as unknown as Pool;
    const repo = new SecurityAuditRepository(pool, new AuditWriteLimiter(), clock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repo.logInvalidRedirect('/api/auth/login', 'x')).resolves.toBeUndefined();
  });
});
