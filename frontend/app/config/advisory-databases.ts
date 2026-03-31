// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export interface AdvisoryDatabase {
  prefix: string;
  baseUrl: string;
  buildUrl: (id: string) => string;
}

export const advisoryDatabases: AdvisoryDatabase[] = [
  {
    prefix: 'CVE',
    baseUrl: 'https://nvd.nist.gov/vuln/detail',
    buildUrl: (id: string) => `https://nvd.nist.gov/vuln/detail/${id}`,
  },
  {
    prefix: 'GHSA',
    baseUrl: 'https://github.com/advisories',
    buildUrl: (id: string) => `https://github.com/advisories/${id}`,
  },
  {
    prefix: 'GO',
    baseUrl: 'https://pkg.go.dev/vuln',
    buildUrl: (id: string) => `https://pkg.go.dev/vuln/${id}`,
  },
  {
    prefix: 'PYSEC',
    baseUrl: 'https://osv.dev/vulnerability',
    buildUrl: (id: string) => `https://osv.dev/vulnerability/${id}`,
  },
  {
    prefix: 'RUSTSEC',
    baseUrl: 'https://rustsec.org/advisories',
    buildUrl: (id: string) => `https://rustsec.org/advisories/${id}.html`,
  },
];

export const getAdvisoryUrl = (vulnerabilityId: string): string => {
  const database = advisoryDatabases.find((db) => vulnerabilityId.startsWith(db.prefix));

  if (database) {
    return database.buildUrl(vulnerabilityId);
  }

  // Default to NVD for unknown ID formats
  return `https://nvd.nist.gov/vuln/detail/${vulnerabilityId}`;
};
