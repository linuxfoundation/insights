// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { Pagination } from '~~/types/shared/pagination';
import type { ProjectList, ProjectTinybird } from '~~/types/project';

/**
 * API Endpoint: /api/project
 * Method: GET
 * Description: Fetches a paginated list of projects with sorting options and additional metadata.
 *
 * Query Parameters:
 * - sort (string, optional): Specifies the sorting order for the projects (default: "name_asc").
 * - page (number, optional): The page number for pagination (default: 0).
 * - pageSize (number, optional): The number of projects per page (default: 10).
 * - count (boolean, optional): Whether to include the total count of projects (default: false).
 * - isLf (boolean, optional): If a project belongs to lf (default: false).
 * - collectionSlug (string, optional): The slug of the collection to filter projects by.
 *
 * Response:
 * - page (number): The current page number in the response.
 * - pageSize (number): The number of projects returned in the response.
 * - total (number): The total number of projects available (if `count` is true).
 * - data (Array<Project>): The list of projects in the current page.
 *
 * Project Response Object (Project):
 * - id (string): The unique identifier of the project.
 * - name (string): The name of the project.
 * - slug (string): The slug of the project.
 * - description (string): A brief description of the project.
 * - logo (string): URL to the logo of the project.
 * - contributorCount (number): The count of contributors involved in the project.
 * - organizationCount (number): The count of organizations associated with the project.
 *
 * Errors:
 * - 500: Internal Server Error.
 */
export default defineEventHandler(async (event): Promise<Pagination<ProjectList> | Error> => {
  const query = getQuery(event);
  const sort: string = (query?.sort as string) || 'name_asc';
  const search: string = (query?.search as string) || undefined;
  const [orderByField, orderByDirection] = sort.split('_');

  // Pagination parameters
  const page: number = +(query?.page ?? 0);
  const pageSize: number = +(query?.pageSize ?? 10);
  const count: boolean = !!query?.count;
  const onboarded: boolean = !!query?.onboarded;
  const collectionSlug: string | undefined = (query?.collectionSlug as string) || undefined;
  const isLF: boolean | undefined = query?.isLF === 'true' ? true : undefined;

  const slugs = Array.isArray(query.slugs) ? query.slugs : query.slugs ? [query.slugs] : undefined;
  const healthScore: boolean | undefined = query?.healthScore === 'true' ? true : undefined;

  try {
    const res = await fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
      count,
      page,
      pageSize,
      collectionSlug,
      slugs,
      isLF,
      orderByField,
      orderByDirection,
      search,
      onboarded: onboarded ? 'true' : undefined,
    });

    let projects = res.data.map((p: ProjectTinybird) => ({
      ...p,
      isLF: !!p.isLF,
      repoData: undefined,
    }));

    if (res.data?.length > 0 && healthScore) {
      const projectSlugs = res.data.map((p: ProjectTinybird) => p.slug);
      const healthScore = await fetchFromTinybird<ProjectTinybird[]>(
        '/v0/pipes/health_score_overview.json',
        {
          slugs: projectSlugs,
        },
      );
      projects = projects.map((p) => ({
        ...p,
        healthScore: {
          ...(healthScore.data.find((hs) => hs.slug === p.slug) || undefined),
          widgets: undefined,
          id: undefined,
          segmentId: undefined,
          slug: undefined,
        },
      }));
    }

    type ProjectCount = { 'count(id)': number };
    const projectCountResult = await fetchFromTinybird<ProjectCount[]>(
      '/v0/pipes/projects_list.json',
      {
        collectionSlug,
        isLF,
        slugs,
        onboarded: onboarded ? 'true' : undefined,
        count: true,
      },
    );

    return {
      page,
      pageSize,
      total: projectCountResult.data[0]?.['count(id)'] || 0,
      data: projects,
    };
  } catch (error) {
    console.error('Error fetching project list from TinyBird:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
