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
import type {
  HealthScoreV2Results,
  ImpactBreakdownResults,
  HealthBreakdownResults,
} from '~~/types/overview/responses.types';
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
  fetchHealthScoreV2(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.HEALTH_SCORE_V2,
      params.value.projectSlug,
      params.value.repos,
    ]);
    const queryFn: QueryFunction<HealthScoreV2Results> = async () =>
      await $fetch(`/api/project/${params.value.projectSlug}/overview/health-score-v2`, {
        params: { repos: params.value.repos },
      });

    return useQuery<HealthScoreV2Results>({
      queryKey,
      queryFn,
    });
  }

  fetchHealthScoreImpactBreakdown(params: ComputedRef<{ projectSlug: string }>) {
    const queryKey = computed(() => [
      TanstackKey.HEALTH_SCORE_IMPACT_BREAKDOWN,
      params.value.projectSlug,
    ]);
    const queryFn: QueryFunction<ImpactBreakdownResults> = async () =>
      await $fetch(`/api/project/${params.value.projectSlug}/overview/health-score-impact`);

    return useQuery<ImpactBreakdownResults>({
      queryKey,
      queryFn,
    });
  }

  fetchHealthScoreBreakdown(params: ComputedRef<OverviewQueryParams>) {
    const queryKey = computed(() => [
      TanstackKey.HEALTH_SCORE_BREAKDOWN,
      params.value.projectSlug,
      params.value.repos,
    ]);
    const queryFn: QueryFunction<HealthBreakdownResults> = async () =>
      await $fetch(`/api/project/${params.value.projectSlug}/overview/health-score-breakdown`, {
        params: { repos: params.value.repos },
      });

    return useQuery<HealthBreakdownResults>({
      queryKey,
      queryFn,
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
