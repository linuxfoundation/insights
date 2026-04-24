// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useQuery } from '@tanstack/vue-query';
import { useRequestURL } from 'nuxt/app';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type {
  AgenticDataResponse,
  ResearchPapersData,
  GitHubEcosystemBreadthData,
  AgenticGlanceData,
  AgenticEnrichedProject,
} from '~~/types/report/agentic-ai-momentum.types';

const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

const BASE_PATH = '/data/agentic-ai-momentum';

function publicFetch<T>(path: string) {
  const { origin } = useRequestURL();
  return $fetch<T>(path, { baseURL: origin });
}

class AgenticAiMomentumApiService {
  fetchGlance() {
    return useQuery<AgenticGlanceData>({
      queryKey: [TanstackKey.AGENTIC_AI_GLANCE],
      queryFn: () => $fetch<AgenticGlanceData>('/api/report/agentic-ai-momentum/glance'),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchTbProjects() {
    return useQuery<AgenticEnrichedProject[]>({
      queryKey: [TanstackKey.AGENTIC_AI_TB_PROJECTS],
      queryFn: () => $fetch<AgenticEnrichedProject[]>('/api/report/agentic-ai-momentum/projects'),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchResearchPapers() {
    return useQuery<AgenticDataResponse<ResearchPapersData>>({
      queryKey: [TanstackKey.AGENTIC_AI_RESEARCH_PAPERS],
      queryFn: () =>
        publicFetch<AgenticDataResponse<ResearchPapersData>>(
          `${BASE_PATH}/research_papers_count.json`,
        ),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }

  fetchGitHubEcosystemBreadth() {
    return useQuery<AgenticDataResponse<GitHubEcosystemBreadthData>>({
      queryKey: [TanstackKey.AGENTIC_AI_GITHUB_BREADTH],
      queryFn: () =>
        publicFetch<AgenticDataResponse<GitHubEcosystemBreadthData>>(
          `${BASE_PATH}/github_ecosystem_breadth.json`,
        ),
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    });
  }
}

export const AGENTIC_AI_MOMENTUM_API_SERVICE = new AgenticAiMomentumApiService();
