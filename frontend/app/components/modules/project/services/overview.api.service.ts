// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import { type ComputedRef, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { lfxWidgetArea } from '../../widget/config/widget-area.config';
import type { WidgetArea } from '../../widget/types/widget-area';
import type { Widget } from '../../widget/types/widget';
import type { WidgetConfig } from '../../widget/config/widget.config';
import { lfxWidgets } from '../../widget/config/widget.config';
import type { HealthScoreResults } from '~~/types/overview/responses.types';
import { TanstackKey } from '~/components/shared/types/tanstack';
import type { Organization } from '~~/types/contributors/responses.types';

export interface OverviewQueryParams {
  projectSlug: string;
  repos?: string[];
}

export interface ScoreDataQueryParams extends OverviewQueryParams {
  type: string;
}

// TODO: Refactor other services to follow this pattern
class OverviewApiService {
  fetchHealthScoreOverview(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.HEALTH_SCORE_OVERVIEW,
      params.value.projectSlug,
      params.value.repos,
    ]);
    const queryFn = computed<QueryFunction<HealthScoreResults>>(() =>
      this.healthScoreOverviewQueryFn(() => ({
        projectSlug: params.value.projectSlug,
        repos: params.value.repos,
      })),
    );

    return useQuery<HealthScoreResults>({
      queryKey,
      queryFn,
    });
  }

  healthScoreOverviewQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<HealthScoreResults> {
    const { projectSlug, repos } = query();
    return async () =>
      await $fetch(`/api/project/${projectSlug}/overview/health-score-overview`, {
        params: {
          repos,
        },
      });
  }

  fetchAssociatedOrganization(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.ASSOCIATED_ORGANIZATION,
      params.value.projectSlug,
    ]);
    const queryFn = computed<QueryFunction<Organization>>(() =>
      this.associatedOrganizationQueryFn(() => ({
        projectSlug: params.value.projectSlug,
      })),
    );

    return useQuery<Organization>({
      queryKey,
      queryFn,
    });
  }

  associatedOrganizationQueryFn(
    query: () => Record<string, string | number | boolean | undefined | string[] | null>,
  ): QueryFunction<Organization> {
    const { projectSlug } = query();

    return async () =>
      await $fetch(`/api/project/${projectSlug}/overview/associated-organization`, {
        params: {
          projectSlug,
        },
      });
  }

  getOverviewWidgetConfigs(widgetArea: WidgetArea): WidgetConfig[] {
    return (lfxWidgetArea[widgetArea].widgets || [])
      .filter((widget) => {
        const widgetConfig = lfxWidgets[widget as Widget];
        return widgetConfig.benchmark;
      })
      .map((widget) => lfxWidgets[widget as Widget]);
  }
}

export const OVERVIEW_API_SERVICE = new OverviewApiService();
