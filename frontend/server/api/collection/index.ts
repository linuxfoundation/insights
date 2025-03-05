interface CollectionResponse {
    id: string;
    name: string;
    slug: string;
    description: string;
    isLf: number;
    projectsCount: number;
    featuredProjects: {
        name: string;
        slug: string;
        logo: string;
    }[];
}

/**
 * API Endpoint: /api/collection
 * Method: GET
 * Description: Fetches a paginated list of collections with optional sorting and count information.
 *
 * Query Parameters:
 * - sort (string, optional): Field to sort the results by.
 * - page (number, optional): The page number to fetch (default is 0).
 * - pageSize (number, optional): The number of items per page (default is 10).
 * - count (boolean, optional): Whether to include the total count of items (default is false).
 *
 * Response:
 * - page (number): The current page number.
 * - pageSize (number): The number of items returned per page.
 * - total (number): The total number of items (if count is true).
 * - data (Array<CollectionResponse>): The list of collections.
 *
 * Errors:
 * - 500: Internal Server Error
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const sort: string = (query?.sort as string) || '';

    // Pagination parameters
    const page: number = +(query?.page ?? 0);
    const pageSize: number = +(query?.pageSize ?? 10);
    const count: boolean = !!query?.count;

    try {
        const res = await fetchTinybird<CollectionResponse[]>('/v0/pipes/collections_list.json', {
            count,
            page,
            pageSize,
            sort,
        });

        return {
            page,
            pageSize,
            total: res.rows,
            data: res.data,
        };
    } catch (error) {
        console.error('Error fetching search results:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
