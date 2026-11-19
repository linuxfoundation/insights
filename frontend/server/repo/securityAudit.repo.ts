// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

export type SecurityAuditEventType = 'invalid_redirect' | 'auth_failure' | 'rate_limit_exceeded';

export interface SecurityAuditLogEntry {
  eventType: SecurityAuditEventType;
  endpoint: string;
  ipAddress?: string;
  userAgent?: string;
  attemptedValue?: string;
  details?: Record<string, unknown>;
}

export const AUDIT_FIELD_LIMITS = {
  endpoint: 128,
  ipAddress: 64,
  userAgent: 256,
  attemptedValue: 512,
  details: 1024,
} as const;

export interface AuditWriteLimits {
  perClient: number;
  global: number;
  windowMs: number;
}

const DEFAULT_LIMITS: AuditWriteLimits = {
  perClient: 3,
  global: 20,
  windowMs: 60_000,
};

/**
 * Fixed-window counters for audit writes, kept per process. The global cap bounds table growth
 * even when callers rotate the client address, since that value comes from request headers.
 */
export class AuditWriteLimiter {
  private readonly limits: AuditWriteLimits;
  private windowStart = 0;
  private total = 0;
  private perClient = new Map<string, number>();

  constructor(limits: Partial<AuditWriteLimits> = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...limits };
  }

  tryAcquire(clientKey: string, now: number): boolean {
    if (now - this.windowStart >= this.limits.windowMs) {
      this.windowStart = now;
      this.total = 0;
      this.perClient.clear();
    }
    if (this.total >= this.limits.global) return false;

    const count = this.perClient.get(clientKey) ?? 0;
    if (count >= this.limits.perClient) return false;

    this.perClient.set(clientKey, count + 1);
    this.total += 1;
    return true;
  }
}

const sharedLimiter = new AuditWriteLimiter();

const cap = (value: string | undefined, max: number): string | null =>
  value ? value.slice(0, max) : null;

function capDetails(details: Record<string, unknown> | undefined): string | null {
  if (!details) return null;
  const json = JSON.stringify(details);
  return Buffer.byteLength(json, 'utf8') <= AUDIT_FIELD_LIMITS.details
    ? json
    : JSON.stringify({ truncated: true });
}

export class SecurityAuditRepository {
  constructor(
    private pool: Pool,
    private limiter: AuditWriteLimiter = sharedLimiter,
    private now: () => number = Date.now,
  ) {}

  /**
   * Logs a security audit event to the database.
   * This method is designed to be fire-and-forget - it catches and logs errors
   * internally to avoid affecting the main request flow.
   */
  async logSecurityEvent(entry: SecurityAuditLogEntry): Promise<void> {
    const clientKey = cap(entry.ipAddress, AUDIT_FIELD_LIMITS.ipAddress) ?? 'unknown';
    if (!this.limiter.tryAcquire(clientKey, this.now())) return;

    try {
      const query = `
        INSERT INTO security_audit_logs (
          event_type,
          endpoint,
          ip_address,
          user_agent,
          attempted_value,
          details
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await this.pool.query(query, [
        entry.eventType,
        cap(entry.endpoint, AUDIT_FIELD_LIMITS.endpoint),
        cap(entry.ipAddress, AUDIT_FIELD_LIMITS.ipAddress),
        cap(entry.userAgent, AUDIT_FIELD_LIMITS.userAgent),
        cap(entry.attemptedValue, AUDIT_FIELD_LIMITS.attemptedValue),
        capDetails(entry.details),
      ]);
    } catch (error) {
      // Log to console but don't throw - security logging should not break the main flow
      console.error('Failed to log security audit event:', error);
    }
  }

  /**
   * Logs an invalid redirect attempt.
   * Convenience method for the common case of logging redirect validation failures.
   */
  async logInvalidRedirect(
    endpoint: string,
    attemptedUrl: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'invalid_redirect',
      endpoint,
      ipAddress,
      userAgent,
      attemptedValue: attemptedUrl,
    });
  }
}
