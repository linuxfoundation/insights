// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  AgenticDataResponse,
  AgenticProject,
  StargazersData,
  ForkData,
  ContributorData,
  NewContributors90dData,
  PullRequestMergeRateData,
  PackageDownloadsData,
  ResearchPapersData,
  GitHubEcosystemBreadthData,
  CommitCountData,
  IssueTimeToCloseData,
  CocomoValueData,
} from '~~/types/report/agentic-ai-momentum.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours - static data, cache longer

const BASE_PATH = '/data/agentic-ai-momentum';

class AgenticAiMomentumApiService {
  fetchProjects() {
    return useQuery<AgenticDataResponse<AgenticProject>>({
      queryKey: [TanstackKey.AGENTIC_AI_PROJECTS],
      queryFn: async () => $fetch(`${BASE_PATH}/projects.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchStargazers() {
    return useQuery<AgenticDataResponse<StargazersData>>({
      queryKey: [TanstackKey.AGENTIC_AI_STARGAZERS],
      queryFn: async () => $fetch(`${BASE_PATH}/stargazers_count.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchForks() {
    return useQuery<AgenticDataResponse<ForkData>>({
      queryKey: [TanstackKey.AGENTIC_AI_FORKS],
      queryFn: async () => $fetch(`${BASE_PATH}/fork_count.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchContributors() {
    return useQuery<AgenticDataResponse<ContributorData>>({
      queryKey: [TanstackKey.AGENTIC_AI_CONTRIBUTORS],
      queryFn: async () => $fetch(`${BASE_PATH}/contributor_count.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchNewContributors90d() {
    return useQuery<AgenticDataResponse<NewContributors90dData>>({
      queryKey: [TanstackKey.AGENTIC_AI_NEW_CONTRIBUTORS],
      queryFn: async () => $fetch(`${BASE_PATH}/new_contributors_90d.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchPullRequestMergeRate() {
    return useQuery<AgenticDataResponse<PullRequestMergeRateData>>({
      queryKey: [TanstackKey.AGENTIC_AI_PR_MERGE_RATE],
      queryFn: async () => $fetch(`${BASE_PATH}/pull_request_merge_rate.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchPackageDownloads() {
    return useQuery<AgenticDataResponse<PackageDownloadsData>>({
      queryKey: [TanstackKey.AGENTIC_AI_DOWNLOADS],
      queryFn: async () => $fetch(`${BASE_PATH}/package_downloads_count.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchResearchPapers() {
    return useQuery<AgenticDataResponse<ResearchPapersData>>({
      queryKey: [TanstackKey.AGENTIC_AI_RESEARCH_PAPERS],
      queryFn: async () => $fetch(`${BASE_PATH}/research_papers_count.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchGitHubEcosystemBreadth() {
    return useQuery<AgenticDataResponse<GitHubEcosystemBreadthData>>({
      queryKey: [TanstackKey.AGENTIC_AI_GITHUB_BREADTH],
      queryFn: async () => $fetch(`${BASE_PATH}/github_ecosystem_breadth.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchCommits() {
    return useQuery<AgenticDataResponse<CommitCountData>>({
      queryKey: [TanstackKey.AGENTIC_AI_COMMITS],
      queryFn: async () => $fetch(`${BASE_PATH}/commit_count.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchIssueTimeToClose() {
    return useQuery<AgenticDataResponse<IssueTimeToCloseData>>({
      queryKey: [TanstackKey.AGENTIC_AI_TIME_TO_CLOSE],
      queryFn: async () => $fetch(`${BASE_PATH}/issue_time_to_close.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchCocomoValue() {
    return useQuery<AgenticDataResponse<CocomoValueData>>({
      queryKey: [TanstackKey.AGENTIC_AI_COCOMO],
      queryFn: async () => $fetch(`${BASE_PATH}/project_value_cocomo.json`),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }
}

export const AGENTIC_AI_MOMENTUM_API_SERVICE = new AgenticAiMomentumApiService();
