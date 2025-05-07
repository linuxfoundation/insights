import {fetchFromTinybird} from "~~/server/data/tinybird/tinybird";
import type {SecurityData} from "~~/types/security/responses.types";

export default defineEventHandler(async (event): Promise<SecurityData[] | Error> => {
    const {repo} = getQuery(event) as Record<string, string>;

    const project = (event.context.params as { slug: string }).slug;
    try {
        const res = await fetchFromTinybird<SecurityData[]>('/v0/pipes/security_and_best_practices.json', {
            project,
            repo,
        });
        return res.data;
    } catch (err) {
        console.error('Error fetching project security details:', err);
        return createError({statusCode: 500, statusMessage: 'Internal server error'});
    }
});
