// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { OrganizationProject, OrganizationProjectsPage } from '~~/types/organization-page';

interface TinybirdOrgPageProject {
  projectSlug: string;
  projectName: string;
  projectLogo: string;
  activityCount: number;
  contributorCount: number;
  maintainersCount: number;
  totalContributors: number;
  orgContributors: number;
  totalCommits: number;
  orgCommits: number;
  totalPrsOpened: number;
  orgPrsOpened: number;
  technicalScore: number;
}

const PAGE_SIZE = 20;

export default defineEventHandler(async (event): Promise<OrganizationProjectsPage> => {
  const orgSlug = getRouterParam(event, 'orgSlug');

  if (!orgSlug) {
    throw createError({ statusCode: 422, statusMessage: 'orgSlug is required' });
  }

  const query = getQuery(event);
  const offset = Number(query.offset ?? 0);

  try {
    const projectsRes = await fetchFromTinybird<TinybirdOrgPageProject[]>(
      '/v0/pipes/org_page_projects.json',
      { orgSlug, limit: PAGE_SIZE + 1, offset },
    );
    const allProjects = projectsRes.data ?? [];
    const hasMore = allProjects.length > PAGE_SIZE;
    const projects = allProjects.slice(0, PAGE_SIZE);

    const data: OrganizationProject[] = projects.map((p) => ({
      projectSlug: p.projectSlug,
      projectName: p.projectName,
      projectLogo: p.projectLogo,
      activityCount: p.activityCount,
      contributorCount: p.contributorCount,
      technicalScore: p.technicalScore,
    }));

    return { data, hasMore };
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
