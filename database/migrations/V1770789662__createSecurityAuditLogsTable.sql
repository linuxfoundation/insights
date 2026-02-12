-- Security audit logs for tracking security-related events
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    attempted_value TEXT,
    details JSONB,
    CONSTRAINT check_event_type CHECK (event_type IN ('invalid_redirect', 'auth_failure', 'rate_limit_exceeded'))
);

-- Index for efficient querying by event type and time
CREATE INDEX idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_created_at ON security_audit_logs(created_at);
