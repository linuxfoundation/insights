// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Roles arrive as a real array, or as a ClickHouse array string like "['maintainer','owner']"
export function parseRolesArray(raw: string[] | string | null | undefined): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || raw === '[]') return [];
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^'|'$/g, ''))
    .filter(Boolean);
}
