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
