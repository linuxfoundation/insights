// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { QueryFunction } from '@tanstack/vue-query'
import { type ComputedRef, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { TanstackKey } from '~/components/shared/types/tanstack'
import type { ActiveDays } from '~~/types/development/responses.types'
import type { ContributionOutsideHours } from '~~/types/development/responses.types'

export interface QueryParams {
  projectSlug: string
  granularity: string
  repos?: string[]
  startDate: string | null
  endDate: string | null
  includeCollaborations?: boolean
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
    ])
    const queryFn = computed<QueryFunction<ActiveDays>>(() =>
      this.activeDaysQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        granularity: params.value.granularity,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    )

    return useQuery<ActiveDays>({
      queryKey,
      queryFn,
    })
  }

  fetchContributionsOutsideWorkHours(params: ComputedRef<QueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.CONTRIBUTIONS_OUTSIDE_WORK_HOURS,
      params.value.projectSlug,
      params.value.repos,
      params.value.startDate,
      params.value.endDate,
      params.value.includeCollaborations,
    ])
    const queryFn = computed<QueryFunction<ContributionOutsideHours>>(() =>
      this.contributionsOutsideWorkHoursQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
        startDate: params.value.startDate,
        endDate: params.value.endDate,
        includeCollaborations: params.value.includeCollaborations,
      })),
    )

    return useQuery<ContributionOutsideHours>({
      queryKey,
      queryFn,
    })
  }

  activeDaysQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ActiveDays> {
    const { projectSlug, repos, granularity, startDate, endDate, includeCollaborations } = query()
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/active-days`, {
        params: {
          repos,
          granularity,
          startDate,
          endDate,
          includeCollaborations,
        },
      })
  }

  contributionsOutsideWorkHoursQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<ContributionOutsideHours> {
    const { projectSlug, repos, startDate, endDate, includeCollaborations } = query()
    return async () =>
      await $fetch(`/api/project/${projectSlug}/development/contribution-outside`, {
        params: {
          repos,
          startDate,
          endDate,
          includeCollaborations,
        },
      })
  }
}

export const DEVELOPMENT_API_SERVICE = new DevelopmentApiService()
