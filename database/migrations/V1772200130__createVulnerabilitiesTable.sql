CREATE TYPE vulnerability_severity AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');
CREATE TYPE vulnerability_status AS ENUM ('OPEN', 'FIX_AVAILABLE', 'RESOLVED');

CREATE TABLE IF NOT EXISTS vulnerability_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_url TEXT NOT NULL,
    ran_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_ms INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'running',
    error TEXT,
    vuln_count INT NOT NULL DEFAULT 0,
    new_count INT NOT NULL DEFAULT 0,
    resolved_count INT NOT NULL DEFAULT 0,
    scanner_version TEXT NOT NULL DEFAULT '',
    transitive_dependencies_scanned BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_vulnerability_scans_repo_url ON vulnerability_scans(repo_url);
CREATE INDEX idx_vulnerability_scans_ran_at ON vulnerability_scans(ran_at);

CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_url TEXT NOT NULL,
    scan_id UUID NOT NULL REFERENCES vulnerability_scans(id),
    vulnerability_id TEXT NOT NULL,
    cve_ids TEXT[] NOT NULL DEFAULT '{}',
    ghsa_ids TEXT[] NOT NULL DEFAULT '{}',
    other_ids TEXT[] NOT NULL DEFAULT '{}',
    severity vulnerability_severity NOT NULL DEFAULT 'UNKNOWN',
    summary TEXT NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '',
    package_name TEXT NOT NULL,
    package_version TEXT NOT NULL DEFAULT '',
    package_ecosystem TEXT NOT NULL DEFAULT '',
    source_path TEXT NOT NULL DEFAULT '',
    source_type TEXT NOT NULL DEFAULT '',
    status vulnerability_status NOT NULL DEFAULT 'OPEN',
    fixed_version TEXT NOT NULL DEFAULT '',
    published_at TIMESTAMP WITH TIME ZONE,
    modified_at TIMESTAMP WITH TIME ZONE,
    first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(repo_url, vulnerability_id, package_name, source_path)
);

CREATE INDEX idx_vulnerabilities_repo_url ON vulnerabilities(repo_url);
CREATE INDEX idx_vulnerabilities_cve_ids  ON vulnerabilities USING GIN (cve_ids);
CREATE INDEX idx_vulnerabilities_ghsa_ids ON vulnerabilities USING GIN (ghsa_ids);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_vulnerabilities_repo_severity_status ON vulnerabilities(repo_url, severity, status);
CREATE INDEX idx_vulnerabilities_repo_status ON vulnerabilities(repo_url, status);
