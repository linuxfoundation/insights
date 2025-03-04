export async function fetchTinybird(
    path: string,
    query: Record<string, string| boolean| number| string[]>,
) {
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
