// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Raw TB glance row (matches TB pipe output)
export interface HealthScoreCoverageGlanceRow {
  repos_tracked: number;
  repos_scored: number;
  projects_tracked: number;
  projects_scored: number;
  projects_partial: number;
  updated_at: string;
}

// Processed glance data for frontend
export interface HealthScoreCoverageGlanceData {
  reposTracked: number;
  reposScored: number;
  projectsTracked: number;
  projectsScored: number;
  projectsPartial: number;
  updatedAt: string;
}
