// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { TrustScoreSummary } from '~~/types/overview/responses.types';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { ScoreData } from '~~/types/shared/benchmark.types';
import type { Organization } from '~~/types/contributors/responses.types';

export interface OverviewQueryParams {
  projectSlug: string;
  repository?: string;
}

export interface ScoreDataQueryParams extends OverviewQueryParams {
  type: string;
}

// TODO: Refactor other services to follow this pattern
class OverviewApiService {
  fetchTrustScoreSummary(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.TRUST_SCORE_SUMMARY,
      params.value.projectSlug,
      params.value.repository
    ]);
    const queryFn = computed<QueryFunction<TrustScoreSummary>>(() => this.trustScoreSummaryQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repository: params.value.repository
      })));

    return useQuery<TrustScoreSummary>({
      queryKey,
      queryFn
    });
  }

  trustScoreSummaryQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<TrustScoreSummary> {
    const { projectSlug, repository } = query();
    return async () => await $fetch(`/api/project/${projectSlug}/overview/score-summary`, {
        params: {
          repository
        }
      });
  }

  fetchScoreData(params: ComputedRef<ScoreDataQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.SCORE_DATA,
      params.value.projectSlug,
      params.value.repository,
      params.value.type
    ]);
    const queryFn = computed<QueryFunction<ScoreData[]>>(() => this.scoreDataQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repository: params.value.repository,
        type: params.value.type
      })));

    return useQuery<ScoreData[]>({
      queryKey,
      queryFn
    });
  }

  scoreDataQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<ScoreData[]> {
    const { projectSlug, repository, type } = query();

    return async () => await $fetch(`/api/project/${projectSlug}/overview/score-data`, {
        params: {
          repository,
          type
        }
      });
  }

  fetchAssociatedOrganization(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ASSOCIATED_ORGANIZATION,
      params.value.projectSlug
    ]);
    const queryFn = computed<QueryFunction<Organization>>(() => this.associatedOrganizationQueryFn(() => ({
        projectSlug: params.value.projectSlug
      })));

    return useQuery<Organization>({
      queryKey,
      queryFn
    });
  }

  associatedOrganizationQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<Organization> {
    const { projectSlug } = query();

    return async () => await $fetch(`/api/project/${projectSlug}/overview/associated-organization`, {
        params: {
          projectSlug
        }
      });
  }
}

export const OVERVIEW_API_SERVICE = new OverviewApiService();
