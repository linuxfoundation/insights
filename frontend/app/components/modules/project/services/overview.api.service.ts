// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query'
import { type ComputedRef, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { lfxWidgetArea } from '../../widget/config/widget-area.config'
import type { WidgetArea } from '../../widget/types/widget-area'
import type { Widget } from '../../widget/types/widget'
import type { WidgetConfig } from '../../widget/config/widget.config'
import { lfxWidgets } from '../../widget/config/widget.config'
import type { HealthScore, HealthScoreResults } from '~~/types/overview/responses.types'
import { TanstackKey } from '~/components/shared/types/tanstack'
import type { Organization } from '~~/types/contributors/responses.types'
import { benchmarkConfigs } from '~~/app/config/benchmarks'

export interface OverviewQueryParams {
  projectSlug: string
  repos?: string[]
}

export interface ScoreDataQueryParams extends OverviewQueryParams {
  type: string
}

// TODO: Refactor other services to follow this pattern
class OverviewApiService {
  fetchHealthScoreOverview(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [TanstackKey.HEALTH_SCORE_OVERVIEW, params.value.projectSlug, params.value.repos])
    const queryFn = computed<QueryFunction<HealthScoreResults>>(() =>
      this.healthScoreOverviewQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
      }))
    )

    return useQuery<HealthScoreResults>({
      queryKey,
      queryFn,
    })
  }

  healthScoreOverviewQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<HealthScoreResults> {
    const { projectSlug, repos } = query()
    return async () =>
      await $fetch(`/api/project/${projectSlug}/overview/health-score-overview`, {
        params: {
          repos,
        },
      })
  }

  fetchAssociatedOrganization(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [TanstackKey.ASSOCIATED_ORGANIZATION, params.value.projectSlug])
    const queryFn = computed<QueryFunction<Organization>>(() =>
      this.associatedOrganizationQueryFn(() => ({
        projectSlug: params.value.projectSlug,
      }))
    )

    return useQuery<Organization>({
      queryKey,
      queryFn,
    })
  }

  associatedOrganizationQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>
  ): QueryFunction<Organization> {
    const { projectSlug } = query()

    return async () =>
      await $fetch(`/api/project/${projectSlug}/overview/associated-organization`, {
        params: {
          projectSlug,
        },
      })
  }

  convertRawResultsToHealthScore(_: HealthScoreResults): HealthScore[] {
    return [
      // Dont do this and use benchmark configs
    ]
  }

  getOverviewWidgets(widgetArea: WidgetArea): Widget[] {
    return (lfxWidgetArea[widgetArea].widgets || []).filter((widget) => {
      const widgetConfig = lfxWidgets[widget as Widget]
      return widgetConfig.benchmark
    })
  }

  getOverviewWidgetConfigs(widgetArea: WidgetArea): WidgetConfig[] {
    return this.getOverviewWidgets(widgetArea).map((widget) => lfxWidgets[widget as Widget])
  }

  // TODO: refactor this, this is a temporary solution to get the point details
  // The health score overview endpoint should return the actual point
  getPointDetails(value: number, key: string) {
    const dashedKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    const benchmarkConfig = benchmarkConfigs.find((config) => config.key === dashedKey)
    return benchmarkConfig?.points.find(
      (point) => point.pointStart <= value && (point.pointEnd === null || point.pointEnd >= value)
    )
  }
}

export const OVERVIEW_API_SERVICE = new OverviewApiService()
