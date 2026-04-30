// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Base wrapper for all data files
export interface AgenticDataResponse<T> {
  metadata: {
    fetched_at: string;
    schema: {
      name: string;
      description: string;
      fields: Array<{
        name: string;
        type: string;
        description: string;
        optional: boolean;
      }>;
    };
    covered_items?: string[];
  };
  data: T[];
}

// Project metadata
export interface AgenticProject {
  name: string;
  layer: string;
  github_url: string | null;
  github_url_display: string | null;
}

// Research papers
export interface ResearchPapersData {
  topic: string;
  month: string;
  paper_count: number;
}

// GitHub ecosystem breadth
export interface GitHubEcosystemBreadthData {
  search_term: string;
  month: string;
  repo_count: number;
  issue_count: number;
  discussion_count: number;
}

// GitHub releases (still read server-side for merging)
export interface GitHubReleasesData {
  repo: string;
  month: string;
  cumulative_release_count: number;
}

// Ecosystem layer definitions
export type EcosystemLayer =
  | 'Protocols & Standards'
  | 'Orchestration & Multi-Agent'
  | 'Personal & Coding Agents'
  | 'Computer Use & Browser Agents'
  | 'MCP Infrastructure'
  | 'Memory & Retrieval'
  | 'Tool Use & Integration'
  | 'Evaluation & Observability'
  | 'Agent-Optimized Models'
  | 'Safety & Guardrails'
  | 'Developer Tooling & SDKs'
  | 'Agent Infrastructure'
  | 'Voice & Multimodal Agents'
  | 'Research & Vertical Agents';

// Research topic definitions
export type ResearchTopic =
  | 'autonomous_agents'
  | 'multi_agent_systems'
  | 'llm_tool_use'
  | 'agent_memory_planning'
  | 'agent_safety_alignment'
  | 'agentic_rag';

// Aggregated project data for the leaderboard
export interface ProjectLeaderboardRow {
  slug: string;
  name: string;
  layer: EcosystemLayer | string;
  githubUrl: string | null;
  stars: number | null;
  starsDelta: number | null;
  forks: number | null;
  forksDelta: number | null;
  commits: number | null;
  commitsDelta: number | null;
  contributors: number | null;
  contributorsDelta: number | null;
  mergeRate: number | null;
  mergeRateDelta: number | null;
  timeToClose: number | null;
  timeToCloseDelta: number | null;
  downloads: number | null;
  downloadsDelta: number | null;
  cocomoValue: number | null;
  prTimeToResolve: number | null;
  prTimeToResolveDelta: number | null;
  totalVulnerabilities: number | null;
  totalVulnerabilitiesDelta: number | null;
  newContributors: number | null;
  newContributorsDelta: number | null;
  githubReleases: number | null;
  githubReleasesDelta: number | null;
  issueResponseTime: number | null;
  issueResponseTimeDelta: number | null;
  noResponseIssues: number | null;
  noResponseIssuesDelta: number | null;
  dockerHubPulls: number | null;
  dockerHubPullsDelta: number | null;
  dependentRepositories: number | null;
  dependentRepositoriesDelta: number | null;
  dependentPackages: number | null;
  dependentPackagesDelta: number | null;
}

// Metric explorer options
export type MetricKey =
  | 'stars'
  | 'forks'
  | 'contributors'
  | 'downloads'
  | 'mergeRate'
  | 'timeToClose'
  | 'commits'
  | 'pullRequests'
  | 'cocomoValue'
  | 'totalVulnerabilities'
  | 'prTimeToResolve'
  | 'releases'
  | 'dockerHubPulls'
  | 'dependentRepositories'
  | 'dependentPackages'
  | 'newContributors'
  | 'issueResponseTime'
  | 'noResponseIssues';

export type MetricGroup = 'Growth' | 'Community' | 'Health' | 'Value';

export interface MetricOption {
  key: MetricKey;
  label: string;
  format: 'number' | 'percent' | 'days';
  group: MetricGroup;
}

// Scatter plot data point
export interface ScatterDataPoint {
  name: string;
  layer: string;
  x: number;
  y: number;
  githubUrl: string | null;
}

// Raw TB glance row (matches TB pipe output)
export interface AgenticGlanceRow {
  total_count: number;
  total_software_value: number;
  total_contributor_count: number;
  total_contributor_count_30d: number;
  commits_count_30d: number;
  most_active_projects: string; // JSON string
  median_issue_close_time_seconds: number;
  median_issue_close_time_seconds_30d: number;
  median_pr_resolution_time_seconds: number;
  median_pr_resolution_time_seconds_30d: number;
  projects_with_github_pr_activity: number;
  projects_with_github_issue_activity: number;
}

// Processed glance data for frontend
export interface AgenticGlanceData {
  totalCount: number;
  totalSoftwareValue: number;
  totalContributorCount: number;
  totalContributorCount30d: number;
  commitsCount30d: number;
  mostActiveProjects: Array<{ name: string; slug: string; newContributors: number }>;
  medianIssueCloseTimeDays: number;
  medianIssueCloseTimeDays30d: number;
  medianPrResolutionTimeDays: number;
  medianPrResolutionTimeDays30d: number;
  projectsWithGithubPrActivity: number;
  projectsWithGithubIssueActivity: number;
}

// Raw TB project row (matches TB pipe output)
export interface AgenticTbProjectRow {
  project_id: string;
  name: string;
  slug: string;
  github_repo_link: string;
  stars: number | null;
  stars_30d: number | null;
  forks: number | null;
  forks_30d: number | null;
  downloads: number | null;
  downloads_30d: number | null;
  docker_pulls: number | null;
  docker_pulls_30d: number | null;
  dependent_repos: number | null;
  dependent_packages: number | null;
  commits: number | null;
  commits_30d: number | null;
  contributors: number | null;
  contributors_30d: number | null;
  new_contributors_30d: number | null;
  merge_rate: number | null;
  merge_rate_30d: number | null;
  pr_resolve_time_seconds: number | null;
  pr_resolve_time_seconds_30d: number | null;
  issue_close_time_seconds: number | null;
  issue_close_time_seconds_30d: number | null;
  issue_response_time_seconds: number | null;
  issue_response_time_seconds_30d: number | null;
  no_response_issues: number | null;
  no_response_issues_30d: number | null;
  vulnerabilities: number | null;
  vulnerabilities_30d: number | null;
  cocomo_value: number | null;
}

// Enriched project (TB data merged with layer/releases from static JSON)
export interface AgenticEnrichedProject {
  projectId: string;
  name: string;
  slug: string;
  githubRepoLink: string;
  layer: EcosystemLayer | string;
  // All-time values
  stars: number | null;
  forks: number | null;
  downloads: number | null;
  dockerPulls: number | null;
  dependentRepos: number | null;
  dependentPackages: number | null;
  commits: number | null;
  contributors: number | null;
  newContributors30d: number | null;
  mergeRate: number | null;
  prResolveTimeDays: number | null;
  issueCloseTimeDays: number | null;
  issueResponseTimeDays: number | null;
  noResponseIssues: number | null;
  vulnerabilities: number | null;
  cocomoValue: number | null;
  githubReleases: number | null;
  // 30d delta values
  stars30d: number | null;
  forks30d: number | null;
  downloads30d: number | null;
  dockerPulls30d: number | null;
  commits30d: number | null;
  contributors30d: number | null;
  mergeRate30d: number | null;
  prResolveTimeDays30d: number | null;
  issueCloseTimeDays30d: number | null;
  issueResponseTimeDays30d: number | null;
  noResponseIssues30d: number | null;
  vulnerabilities30d: number | null;
  githubReleases30d: number | null;
}
