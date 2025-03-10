import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {Project} from "~~/types/project";

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
 * - projectId (string): The unique identifier of the project associated with the repository.
 * - projectName (string): The name of the project associated with the repository.
 * - projectSlug (string): The slug of the project associated with the repository.
 * - repo (string): The name of the repository.
 *
 * Errors:
 * - 404: Project not found.
 * - 500: Internal Server Error.
 */
export default defineEventHandler(async (event): Promise<Project | Error> => {
    const {slug} = event.context.params as Record<string, string>;
    try {
        const res = await fetchFromTinybird<Project[]>('/v0/pipes/projects_list.json', {
            slug,
        });
        if (!res.data || res.data.length === 0) {
            return createError({statusCode: 404, statusMessage: 'Project not found'});
        }
        return res.data[0];
    } catch (err) {
        console.error('Error fetching project:', err);
        return createError({statusCode: 500, statusMessage: 'Internal server error'});
    }
});
