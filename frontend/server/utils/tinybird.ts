export interface TinybirdResponse<T>{
    data: T;
    meta: {
        name: string;
        type: string;
    }[],
    rows: number;
    'rows_before_limit_at_least': number;
    statistics: {
        elapsed: number;
        rows_read: number;
        bytes_read: number;
    }
}

export async function fetchTinybird<T>(
    path: string,
    query: Record<string, string| boolean| number| string[]>,
): Promise<TinybirdResponse<T>> {
    const config = useRuntimeConfig();
    const url = `${config.tinybirdBaseUrl}${path}`;

    // We need to format the dates so that Tinybird can understand them
    const mandatoryQuery = {
        token: config.tinybirdToken
    };

    return await $fetch(url, {
        query: {
            ...mandatoryQuery,
            ...query
        }
    });
}
