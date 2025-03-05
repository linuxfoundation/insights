interface CollectionDetailsResponse {
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

export default defineEventHandler(async (event) => {
    const {slug} = event.context.params as Record<string, string>;
    try {
        const res = await fetchTinybird<CollectionDetailsResponse[]>('/v0/pipes/collections_list.json', {
            slug,
        });
        if (!res.data || res.data.length === 0) {
            return createError({statusCode: 404, statusMessage: 'Collection not found'});
        }
        return res.data[0];
    } catch (err) {
        console.error('Error fetching search results:', err);
        return createError({statusCode: 500, statusMessage: 'Internal server error'});
    }
});
