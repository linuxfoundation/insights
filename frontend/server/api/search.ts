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
 * API Endpoint: Search Collections, Projects, and Repositories
 *
 * This handler processes search requests for collections, projects, and repositories.
 * It fetches data from the Tinybird API and categorizes the results based on their types.
 *
 * @param {Event} event - The incoming request event containing the query parameters.
 *
 * Query Parameters:
 * - query (string): The search term to filter results (optional).
 *
 * @returns {Promise<{ projects: SearchResponse[], repositories: SearchResponse[], collections: SearchResponse[] }>}
 * - Returns an object containing arrays of categorized search results (projects, repositories, collections).
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
