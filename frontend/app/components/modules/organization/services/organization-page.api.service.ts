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
  fetchProfile(orgSlug: string): QueryFunction<OrganizationProfile> {
    return () => $fetch(`/api/organization-page/${orgSlug}`);
  }

  fetchKpis(orgSlug: string): QueryFunction<OrganizationKpis> {
    return () => $fetch(`/api/organization-page/${orgSlug}/kpis`);
  }

  fetchProjects(orgSlug: string) {
    return useInfiniteQuery<OrganizationProjectsPage>({
      queryKey: [TanstackKey.ORGANIZATION_PAGE_PROJECTS, orgSlug],
      queryFn: ({ pageParam }) =>
        $fetch(`/api/organization-page/${orgSlug}/projects`, {
          params: { offset: (pageParam as number) ?? 0 },
        }),
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasMore) return undefined;
        return allPages.length * PAGE_SIZE;
      },
      initialPageParam: 0,
    });
  }

  fetchActivityTimeseries(orgSlug: string): QueryFunction<OrgActivityTimeseries[]> {
    return () => $fetch(`/api/organization-page/${orgSlug}/activity-timeseries`);
  }

  fetchContributorTimeseries(orgSlug: string): QueryFunction<OrgContributorTimeseries[]> {
    return () => $fetch(`/api/organization-page/${orgSlug}/contributor-timeseries`);
  }

  fetchContributors(orgSlug: string): QueryFunction<OrgContributor[]> {
    return () => $fetch(`/api/organization-page/${orgSlug}/contributors`);
  }
}

export const ORGANIZATION_PAGE_API_SERVICE = new OrganizationPageApiService();
