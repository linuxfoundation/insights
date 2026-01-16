// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
import type { SearchCollection, SearchProject, SearchRepository } from '~~/types/search';
import { getRepoNameFromUrl, getRepoSlugFromName } from '~~/server/helpers/repository.helpers';

export interface SearchResponse {
  type: 'project' | 'repository' | 'collection';
  slug: string;
  logo: string | null;
  projectSlug: string | null;
  name: string | null;
  archived: boolean | null;
  excluded: boolean | null;
  status: string;
}

/**
 * API Endpoint: /api/search
 * Method: GET
 * Description: Searches for collections, projects, and repositories based on the provided query.
 *
 * Query Parameters:
 * - query (string, optional): The search term to query collections, projects, and repositories.
 * - limit (number, optional): The maximum number of results to return (default: 10).
 *
 * Response:
 * - projects (Array<SearchResponse>): A list of search results of type "project".
 * - repositories (Array<SearchResponse>): A list of search results of type "repository".
 * - collections (Array<SearchResponse>): A list of search results of type "collection".
 *
 * Search Response Object (SearchResponse):
 * - type (string): The type identifier for the search result (e.g., "project", "repository", "collection").
 * - slug (string): A unique slug identifier for the search result.
 * - logo (string | null): The logo URL associated with the search result, or null if unavailable.
 * - projectSlug (string | null): The project slug associated with the result, or null if absent.
 * - name (string | null): The name or title of the search result, or null if not provided.
 *
 * Errors:
 * - 500: Internal Server Error.
 */
export default defineEventHandler(async (event) => {
  const query: Record<string, string | number> = getQuery(event);
  const searchQuery = query?.query || '';

  const projects: SearchProject[] = [];
  const repositories: SearchRepository[] = [];
  const collections: SearchCollection[] = [];

  const limit: number = 10;

  try {
    const res = await fetchFromTinybird<SearchResponse[]>(
      '/v0/pipes/search_collections_projects_repos.json',
      {
        limit,
        search: searchQuery,
      },
    );

    if (res.data?.length > 0) {
      res.data.forEach((item) => {
        if (item.type === 'project') {
          projects.push({
            name: item.name as string,
            slug: item.slug,
            logo: item.logo,
            status: item.status,
          });
        } else if (item.type === 'repository') {
          const name = getRepoNameFromUrl(item.slug);
          const slug = getRepoSlugFromName(name);
          repositories.push({
            slug,
            name,
            archived: item.archived || false,
            excluded: item.excluded || false,
            projectSlug: item.projectSlug || '',
          });
        } else if (item.type === 'collection') {
          collections.push({
            slug: item.slug,
            name: item.name || '',
          });
        }
      });
    }

    return {
      projects,
      repositories,
      collections,
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    return {
      projects,
      repositories,
      collections,
    };
  }
});
