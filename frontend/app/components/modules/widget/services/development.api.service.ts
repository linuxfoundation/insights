// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { ActiveDays } from '~~/types/development/responses.types';
import type {
  ContributionOutsideHours,
  CodeReviewEngagement,
  AverageTimeMerge,
  IssuesResolution,
  MergeLeadTime,
  PullRequests,
  ReviewTimeByPrItem,
  WaitTime1stReview,
} from '~~/types/development/responses.types';
import type { CommitActivities } from '~~/types/popularity/responses.types';

export interface QueryParams {
  projectSlug: string;
  granularity: string;
  repos?: string[];
  startDate: string | null;
  endDate: string | null;
  includeCollaborations?: boolean;
}

export interface CodeReviewEngagementQueryParams extends QueryParams {
  metric: string;
}

export interface CommitActivitiesQueryParams extends QueryParams {
  type: string;
  countType: string;
  activityType: string;
}

class DevelopmentApiService {
  fetchActiveDays(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ACTIVE_DAYS,
      params.value.projectSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<ActiveDays>>(() =>
      this.activeDaysQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<ActiveDays>({
      queryKey,
      queryFn,
    });
  }

  fetchContributionsOutsideWorkHours(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CONTRIBUTIONS_OUTSIDE_WORK_HOURS,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ]);
    const queryFn = computed<QueryFunction<ContributionOutsideHours>>(() =>
      this.contributionsOutsideWorkHoursQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    );

    return useQuery<ContributionOutsideHours>({
      queryKey,
      queryFn,
    });
  }

  fetchAverageTimeMerge(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.AVERAGE_TIME_TO_MERGE,
      params.value.projectSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<AverageTimeMerge>>(() =>
      this.averageTimeMergeQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<AverageTimeMerge>({
      queryKey,
      queryFn,
    });
  }

  fetchCodeReviewEngagement(params: ComputedRef<CodeReviewEngagementQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CODE_REVIEW_ENGAGEMENT,
      params.value.projectSlug,
      params.value.metric,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<CodeReviewEngagement>>(() =>
      this.codeReviewEngagementQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        metric: params.value.metric,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<CodeReviewEngagement>({
      queryKey,
      queryFn,
    });
  }

  fetchCommitActivities(params: ComputedRef<CommitActivitiesQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.COMMIT_ACTIVITIES,
      params.value.projectSlug,
      params.value.granularity,
      params.value.type,
      params.value.countType,
      params.value.activityType,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<CommitActivities>>(() =>
      this.commitActivitiesQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        type: params.value.type,
        countType: params.value.countType,
        activityType: params.value.activityType,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<CommitActivities>({
      queryKey,
      queryFn,
    });
  }

  fetchIssuesResolution(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ISSUES_RESOLUTION,
      params.value.projectSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<IssuesResolution>>(() =>
      this.issuesResolutionQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<IssuesResolution>({
      queryKey,
      queryFn,
    });
  }

  fetchMergeLeadTime(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.MERGE_LEAD_TIME,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<MergeLeadTime>>(() =>
      this.mergeLeadTimeQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<MergeLeadTime>({
      queryKey,
      queryFn,
    });
  }

  fetchPullRequests(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.PULL_REQUESTS,
      params.value.projectSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<PullRequests>>(() =>
      this.pullRequestsQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<PullRequests>({
      queryKey,
      queryFn,
    });
  }

  fetchReviewTimeByPrSize(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.REVIEW_TIME_BY_PULL_REQUEST_SIZE,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<ReviewTimeByPrItem[]>>(() =>
      this.reviewTimeByPrSizeQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<ReviewTimeByPrItem[]>({
      queryKey,
      queryFn,
    });
  }

  fetchWaitTimeFirstReview(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.WAIT_TIME_FIRST_REVIEW,
      params.value.projectSlug,
      params.value.granularity,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
    ]);
    const queryFn = computed<QueryFunction<WaitTime1stReview>>(() =>
      this.waitTimeFirstReviewQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
      })),
    );

    return useQuery<WaitTime1stReview>({
      queryKey,
      queryFn,
    });
  }

  activeDaysQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ActiveDays> {
    const { projectSlug, repos, granularity, startDate, endDate, includeCollaborations } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/active-days`, {
        params: {
          repos,
          granularity,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
  }

  contributionsOutsideWorkHoursQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ContributionOutsideHours> {
    const { projectSlug, repos, startDate, endDate, includeCollaborations } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/contribution-outside`, {
        params: {
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      });
  }

  averageTimeMergeQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<AverageTimeMerge> {
    const { projectSlug, repos, granularity, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/average-time-merge`, {
        params: {
          repos,
          granularity,
          startDate,
          endDate,
        },
      });
  }

  codeReviewEngagementQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<CodeReviewEngagement> {
    const { projectSlug, repos, metric, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/code-review-engagement`, {
        params: {
          repos,
          metric,
          startDate,
          endDate,
        },
      });
  }

  commitActivitiesQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<CommitActivities> {
    const { projectSlug, repos, granularity, type, countType, activityType, startDate, endDate } =
      query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/commit-activities`, {
        params: {
          repos,
          granularity,
          type,
          countType,
          activityType,
          startDate,
          endDate,
        },
      });
  }

  issuesResolutionQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<IssuesResolution> {
    const { projectSlug, repos, granularity, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/issues-resolution`, {
        params: {
          repos,
          granularity,
          startDate,
          endDate,
        },
      });
  }

  mergeLeadTimeQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<MergeLeadTime> {
    const { projectSlug, repos, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/merge-lead-time`, {
        params: {
          repos,
          startDate,
          endDate,
        },
      });
  }

  pullRequestsQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<PullRequests> {
    const { projectSlug, repos, granularity, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/pull-requests`, {
        params: {
          repos,
          granularity,
          startDate,
          endDate,
        },
      });
  }

  reviewTimeByPrSizeQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ReviewTimeByPrItem[]> {
    const { projectSlug, repos, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/review-time-by-pr-size`, {
        params: {
          repos,
          startDate,
          endDate,
        },
      });
  }

  waitTimeFirstReviewQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<WaitTime1stReview> {
    const { projectSlug, repos, granularity, startDate, endDate } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/wait-time-1st-review`, {
        params: {
          repos,
          granularity,
          startDate,
          endDate,
        },
      });
  }
}

export const DEVELOPMENT_API_SERVICE = new DevelopmentApiService();
