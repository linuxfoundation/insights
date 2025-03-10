import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {Pagination} from "~~/types/shared/pagination";
import type {Collection} from "~~/types/collection";

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
export default defineEventHandler(async (event): Promise<Pagination<Collection> | Error> => {
    const query = getQuery(event);
    const sort: string = (query?.sort as string) || 'name_asc';
    const [orderByField, orderByDirection] = sort.split('_');

    // Pagination parameters
    const page: number = +(query?.page ?? 0);
    const pageSize: number = +(query?.pageSize ?? 10);
    const count: boolean = !!query?.count;

    console.log({
        count,
        page,
        pageSize,
        orderByField,
        orderByDirection,
    })

    try {
        const res = await fetchFromTinybird<Collection[]>('/v0/pipes/collections_list.json', {
            count,
            page,
            pageSize,
            orderByField,
            orderByDirection,
        });

        const data: Pagination<Collection> = {
            page,
            pageSize,
            total: res.rows,
            data: res.data,
        }

        return data
    } catch (error) {
        console.error('Error collection list:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
