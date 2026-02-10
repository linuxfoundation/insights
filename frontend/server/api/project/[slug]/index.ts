// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type {
  Project,
  ProjectRepository,
  ProjectRepositoryGroup,
  ProjectTinybird,
} from '~~/types/project';
import { getRepoNameFromUrl, getRepoSlugFromName } from '~~/server/helpers/repository.helpers';

/**
 * API Endpoint: /api/projects/{slug}
 * Method: GET
 * Description: Fetches details of a project by its slug, including associated repositories, contributors, and organizations data.
 *
 * Path Parameters:
 * - slug (string, required): The unique identifier of the project.
 *
 * Response:
 * - id (string): The unique identifier of the project.
 * - name (string): The name of the project.
 * - slug (string): The slug of the project.
 * - description (string): A brief description of the project.
 * - logo (string): URL to the logo of the project.
 * - contributorCount (number): The count of contributors involved in the project.
 * - organizationCount (number): The count of organizations associated with the project.
 * - repositories (Array<ProjectRepository>): List of associated repositories for the project.
 *
 * Repository Object (ProjectRepository):
 * - name (string): The name of the repository.
 * - url (string): The url of the repository.
 * - slug (string): The slug the repository.
 *
 * Errors:
 * - 404: Project not found.
 * - 500: Internal Server Error.
 */
export default defineEventHandler(async (event): Promise<Project | Error> => {
  const { slug } = event.context.params as Record<string, string>;
  try {
    const [res, repositoryGroups] = await Promise.all([
      fetchFromTinybird<ProjectTinybird[]>('/v0/pipes/projects_list.json', {
        slug,
        details: true,
      }),
      fetchFromTinybird<ProjectRepositoryGroup[]>('/v0/pipes/repository_groups_list.json', {
        project: slug,
      }),
    ]);
    if (!res.data || res.data.length === 0) {
      return createError({ statusCode: 404, statusMessage: 'Project not found' });
    }
    const project: ProjectTinybird = res.data[0];
    const repoData: Record<string, Partial<ProjectRepository>> = project.repoData.reduce(
      (acc, repo) => {
        const [url, score, rank] = repo;
        acc[url] = {
          score: parseFloat(score),
          rank: parseInt(rank, 10),
        };
        return acc;
      },
      {} as Record<string, Partial<ProjectRepository>>,
    );

    const repositories = project.repositories.map((repoUrl) => {
      const name = getRepoNameFromUrl(repoUrl);
      const slug = getRepoSlugFromName(name);
      const details = repoData[repoUrl] || {};
      return {
        url: repoUrl,
        name,
        slug,
        score: details.score || 0,
        rank: details.rank || 0,
      };
    });
    const projectLinks = [
      ...(project.website ? [{ name: 'Website', url: project.website }] : []),
      ...(project.linkedin ? [{ name: 'Linkedin', url: project.linkedin }] : []),
      ...(project.github ? [{ name: 'Github', url: project.github }] : []),
      ...(project.twitter ? [{ name: 'X', url: project.twitter }] : []),
    ];
    return {
      ...project,
      isLF: !!project.isLF,
      repositories,
      repositoryGroups: repositoryGroups.data || [],
      archivedRepositories: project.archivedRepositories || [],
      excludedRepositories: project.excludedRepositories || [],
      projectLinks,
      repoData: undefined,
      tags: project?.keywords || [],
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }
    console.error('Error fetching project:', err);
    return createError({ statusCode: 500, statusMessage: 'Internal server error' });
  }
});
