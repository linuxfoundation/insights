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

export default defineEventHandler(async (event) => {
    const query: Record<string, string | number> = getQuery(event);
    const searchQuery = query?.query || '';
    const res = await fetchTinybird<SearchResponse[]>('/v0/pipes/search_collections_projects_repos.json', {
        limit: 10,
        search: searchQuery,
    })
    const projects: SearchResponse[] = [];
    const repositories: SearchResponse[] = [];
    const collections: SearchResponse[] = [];

    if(res.data?.length > 0){
        res.data.forEach((item) => {
            if(item.type === 'project'){
                projects.push(item)
            } else if(item.type === 'repository'){
                repositories.push(item)
            } else if(item.type === 'collection'){
                collections.push(item)
            }
        })
    }

    return {
        projects,
        repositories,
        collections
    };
});
