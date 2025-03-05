/**
 * Represents the response object for a search operation.
 *
 * @interface SearchResponse
 *
 * @property {string} type - The type identifier for the search result.
 * @property {string} slug - A unique slug identifier for the search result.
 * @property {string | null} logo - The logo URL associated with the search result or null if unavailable.
 * @property {string | null} projectSlug - The project slug associated with the result or null if absent.
 * @property {string | null} name - The name or title of the search result or null if not provided.
 */
export interface SearchResponse {
    type: string;
    slug: string;
    logo: string | null;
    projectSlug: string | null;
    name: string | null;
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

    const projects: SearchResponse[] = [];
    const repositories: SearchResponse[] = [];
    const collections: SearchResponse[] = [];

    try {
        const res = await fetchTinybird<SearchResponse[]>('/v0/pipes/search_collections_projects_repos.json', {
            limit: 10,
            search: searchQuery,
        })

        if (res.data?.length > 0) {
            res.data.forEach((item) => {
                if (item.type === 'project') {
                    projects.push(item)
                } else if (item.type === 'repository') {
                    repositories.push(item)
                } else if (item.type === 'collection') {
                    collections.push(item)
                }
            })
        }

        return {
            projects,
            repositories,
            collections
        };
    } catch (error) {
        console.error('Error fetching search results:', error);
        return {
            projects,
            repositories,
            collections
        };
    }
});
