// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export const API_VERSIONS: readonly string[] = ['v1'];

const versionPattern = /^v(\d+)(?:-(.+))?$/;

// Maps a URL version id (e.g. 'v1-alpha') to the spec's semver-ish info.version
// (e.g. '1.0.0-alpha'), since the two identifiers are allowed to diverge.
export function specVersionFor(version: string): string {
  const match = versionPattern.exec(version);
  if (!match) {
    return version;
  }
  const [, major, suffix] = match;
  return suffix ? `${major}.0.0-${suffix}` : `${major}.0.0`;
}
