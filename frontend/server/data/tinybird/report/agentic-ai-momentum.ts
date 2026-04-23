// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '../tinybird';
import type {
  AgenticGlanceRow,
  AgenticGlanceData,
  AgenticTbProjectRow,
} from '~~/types/report/agentic-ai-momentum.types';

export async function fetchAgenticGlance(): Promise<AgenticGlanceData> {
  const result = await fetchFromTinybird<AgenticGlanceRow[]>(
    '/v0/pipes/agentic_ai_momentum_glance.json',
    {},
  );

  const row = result.data[0];
  if (!row) {
    throw new Error('No data returned from agentic_ai_momentum_glance');
  }

  let mostActiveProjects: AgenticGlanceData['mostActiveProjects'] = [];
  try {
    mostActiveProjects = JSON.parse(row.most_active_projects);
  } catch {
    mostActiveProjects = [];
  }

  return {
    totalCount: row.total_count,
    totalSoftwareValue: row.total_software_value,
    totalContributorCount: row.total_contributor_count,
    totalContributorCount30d: row.total_contributor_count_30d,
    commitsCount30d: row.commits_count_30d,
    mostActiveProjects,
    medianIssueCloseTimeDays: row.median_issue_close_time_seconds / 86400,
    medianIssueCloseTimeDays30d: row.median_issue_close_time_seconds_30d / 86400,
    medianPrResolutionTimeDays: row.median_pr_resolution_time_seconds / 86400,
    medianPrResolutionTimeDays30d: row.median_pr_resolution_time_seconds_30d / 86400,
    projectsWithGithubPrActivity: row.projects_with_github_pr_activity,
    projectsWithGithubIssueActivity: row.projects_with_github_issue_activity,
  };
}

export async function fetchAgenticProjectsList(): Promise<AgenticTbProjectRow[]> {
  const result = await fetchFromTinybird<AgenticTbProjectRow[]>(
    '/v0/pipes/agentic_ai_projects_list.json',
    {},
  );
  return result.data;
}
