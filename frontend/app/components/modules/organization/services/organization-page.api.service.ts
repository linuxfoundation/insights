// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { useInfiniteQuery } from '@tanstack/vue-query';
import type { QueryFunction } from '@tanstack/vue-query';
import type {
  OrganizationProfile,
  OrganizationKpis,
  OrganizationProjectsPage,
  OrgActivityTimeseries,
  OrgContributorTimeseries,
  OrgContributor,
} from '~~/types/organization-page';
import { TanstackKey } from '~/components/shared/types/tanstack';

const PAGE_SIZE = 20;

class OrganizationPageApiService {
  fetchProfile(orgId: string): QueryFunction<OrganizationProfile> {
    return () => $fetch(`/api/organization-page/${orgId}`);
  }

  fetchKpis(orgId: string): QueryFunction<OrganizationKpis> {
    return () => $fetch(`/api/organization-page/${orgId}/kpis`);
  }

  fetchProjects(orgId: string) {
    return useInfiniteQuery<OrganizationProjectsPage>({
      queryKey: [TanstackKey.ORGANIZATION_PAGE_PROJECTS, orgId],
      queryFn: ({ pageParam }) =>
        $fetch(`/api/organization-page/${orgId}/projects`, {
          params: { offset: (pageParam as number) ?? 0 },
        }),
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasMore) return undefined;
        return allPages.length * PAGE_SIZE;
      },
      initialPageParam: 0,
    });
  }

  fetchActivityTimeseries(orgId: string): QueryFunction<OrgActivityTimeseries[]> {
    return () => $fetch(`/api/organization-page/${orgId}/activity-timeseries`);
  }

  fetchContributorTimeseries(orgId: string): QueryFunction<OrgContributorTimeseries[]> {
    return () => $fetch(`/api/organization-page/${orgId}/contributor-timeseries`);
  }

  fetchContributors(orgId: string): QueryFunction<OrgContributor[]> {
    return () => $fetch(`/api/organization-page/${orgId}/contributors`);
  }
}

export const ORGANIZATION_PAGE_API_SERVICE = new OrganizationPageApiService();
