import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";

interface ProjectResponse {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    contributorsCount: number;
    organizationsCount: number;
}

/**
 * API Endpoint: /api/project
 * Method: GET
 * Description: Fetches a paginated list of projects with sorting options and additional metadata.
 *
 * Query Parameters:
 * - sort (string, optional): Specifies the sorting order for the projects (default: "name_ASC").
 * - page (number, optional): The page number for pagination (default: 0).
 * - pageSize (number, optional): The number of projects per page (default: 10).
 * - count (boolean, optional): Whether to include the total count of projects (default: false).
 * - isLf (boolean, optional): If a project belongs to lf (default: false).
 *
 * Response:
 * - page (number): The current page number in the response.
 * - pageSize (number): The number of projects returned in the response.
 * - total (number): The total number of projects available (if `count` is true).
 * - data (Array<ProjectResponse>): The list of projects in the current page.
 *
 * Project Response Object (ProjectResponse):
 * - id (string): The unique identifier of the project.
 * - name (string): The name of the project.
 * - slug (string): The slug of the project.
 * - description (string): A brief description of the project.
 * - logo (string): URL to the logo of the project.
 * - contributorsCount (number): The count of contributors involved in the project.
 * - organizationsCount (number): The count of organizations associated with the project.
 *
 * Errors:
 * - 500: Internal Server Error.
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const sort: string = (query?.sort as string) || 'name_ASC';

    // Pagination parameters
    const page: number = +(query?.page ?? 0);
    const pageSize: number = +(query?.pageSize ?? 10);
    const count: boolean = !!query?.count;
    const isLf: boolean = !!query?.isLf;

    try {
        const res = await fetchFromTinybird<ProjectResponse[]>('/v0/pipes/projects_list.json', {
            count,
            page,
            pageSize,
            sort,
            isLf,
        });

        return {
            page,
            pageSize,
            total: res.rows,
            data: res.data,
        };
    } catch (error) {
        console.error('Error fetching project list:', error);
        throw createError({statusCode: 500, statusMessage: 'Internal Server Error'});
    }
});
