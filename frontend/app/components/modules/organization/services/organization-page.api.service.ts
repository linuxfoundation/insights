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
  fetchProfile(orgName: string): QueryFunction<OrganizationProfile> {
    return () => $fetch(`/api/organization-page/${orgName}`);
  }

  fetchKpis(orgName: string): QueryFunction<OrganizationKpis> {
    return () => $fetch(`/api/organization-page/${orgName}/kpis`);
  }

  fetchProjects(orgName: string): QueryFunction<OrganizationProject[]> {
    return () => $fetch(`/api/organization-page/${orgName}/projects`);
  }

  fetchActivityTimeseries(orgName: string): QueryFunction<OrgActivityTimeseries[]> {
    return () => $fetch(`/api/organization-page/${orgName}/activity-timeseries`);
  }

  fetchContributorTimeseries(orgName: string): QueryFunction<OrgContributorTimeseries[]> {
    return () => $fetch(`/api/organization-page/${orgName}/contributor-timeseries`);
  }

  fetchContributors(orgName: string): QueryFunction<OrgContributor[]> {
    return () => $fetch(`/api/organization-page/${orgName}/contributors`);
  }
}

export const ORGANIZATION_PAGE_API_SERVICE = new OrganizationPageApiService();
