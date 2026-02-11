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

export class SecurityAuditRepository {
  constructor(private pool: Pool) {}

  /**
   * Logs a security audit event to the database.
   * This method is designed to be fire-and-forget - it catches and logs errors
   * internally to avoid affecting the main request flow.
   */
  async logSecurityEvent(entry: SecurityAuditLogEntry): Promise<void> {
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
        entry.endpoint,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.attemptedValue || null,
        entry.details ? JSON.stringify(entry.details) : null,
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
      details: {
        timestamp: new Date().toISOString(),
      },
    });
  }
}
