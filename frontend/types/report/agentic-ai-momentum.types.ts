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
  rank: number;
  name: string;
  layer: string;
  license: string;
  github_url: string | null;
}

// Time series data with repo and month
export interface RepoMonthMetric {
  repo: string;
  month: string;
}

// Stargazers
export interface StargazersData extends RepoMonthMetric {
  cumulative_stars: number;
}

// Fork count
export interface ForkData extends RepoMonthMetric {
  cumulative_forks: number;
}

// Contributor count
export interface ContributorData extends RepoMonthMetric {
  cumulative_contributors: number;
}

// New contributors 90d
export interface NewContributors90dData extends RepoMonthMetric {
  new_contributors_90d_count: number;
}

// Pull request merge rate
export interface PullRequestMergeRateData extends RepoMonthMetric {
  pr_merge_rate: number;
}

// Issue time to close
export interface IssueTimeToCloseData extends RepoMonthMetric {
  median_time_to_close_days: number;
}

// Package downloads
export interface PackageDownloadsData {
  repo: string;
  ecosystem: string;
  month: string;
  download_counts: number;
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

// Commit count
export interface CommitCountData extends RepoMonthMetric {
  cumulative_commits: number;
}

// PR count
export interface PullRequestCountData extends RepoMonthMetric {
  cumulative_prs: number;
}

// GitHub releases
export interface GitHubReleasesData extends RepoMonthMetric {
  cumulative_releases: number;
}

// Open issues
export interface OpenIssuesData extends RepoMonthMetric {
  open_issues_count: number;
}

// Closed issues
export interface ClosedIssuesData extends RepoMonthMetric {
  closed_issues_count: number;
}

// Dependent packages
export interface DependentPackagesData extends RepoMonthMetric {
  dependent_packages_count: number;
}

// Dependent repos
export interface DependentReposData extends RepoMonthMetric {
  dependent_repos_count: number;
}

// Docker Hub pulls
export interface DockerHubPullsData extends RepoMonthMetric {
  docker_hub_pulls: number;
}

// Docker dependents
export interface DockerDependentsData extends RepoMonthMetric {
  docker_dependents_count: number;
}

// Vulnerabilities
export interface VulnerabilitiesData extends RepoMonthMetric {
  vulnerabilities_count: number;
}

// Fixed vulnerabilities
export interface FixedVulnerabilitiesData extends RepoMonthMetric {
  fixed_vulnerabilities_count: number;
}

// COCOMO project value
export interface CocomoValueData extends RepoMonthMetric {
  estimated_cost_usd: number;
}

// Issue response time
export interface IssueTimeToFirstResponseData extends RepoMonthMetric {
  issue_time_to_first_response_avg_days: number;
}

// Issue no response share
export interface IssueNoResponseShareData extends RepoMonthMetric {
  issue_share_no_response_30d: number;
}

// PR time to resolve
export interface PullRequestTimeToResolveData extends RepoMonthMetric {
  median_time_to_resolve_days: number;
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
  rank: number;
  name: string;
  layer: EcosystemLayer | string;
  license: string;
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
}

// KPI summary data
export interface AgenticKpiSummary {
  projectsTracked: number;
  totalStars: number;
  totalContributors: number;
  packageDownloads: number;
  arxivPapersMonth: number;
  ecosystemLayers: number;
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
  | 'releases';

export interface MetricOption {
  key: MetricKey;
  label: string;
  format: 'number' | 'percent' | 'days';
}

// Scatter plot data point
export interface ScatterDataPoint {
  name: string;
  layer: string;
  x: number;
  y: number;
  githubUrl: string | null;
}
