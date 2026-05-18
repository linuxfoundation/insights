// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { QueryFunction } from '@tanstack/vue-query';
import type {
  OrganizationProfile,
  OrganizationKpis,
  OrganizationProject,
  OrgActivityTimeseries,
  OrgContributorTimeseries,
  OrgContributor,
} from '~~/types/organization-page';

class OrganizationPageApiService {
  fetchProfile(orgId: string): QueryFunction<OrganizationProfile> {
    return () => $fetch(`/api/organization-page/${orgId}`);
  }

  fetchKpis(orgId: string): QueryFunction<OrganizationKpis> {
    return () => $fetch(`/api/organization-page/${orgId}/kpis`);
  }

  fetchProjects(orgId: string): QueryFunction<OrganizationProject[]> {
    return () => $fetch(`/api/organization-page/${orgId}/projects`);
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
