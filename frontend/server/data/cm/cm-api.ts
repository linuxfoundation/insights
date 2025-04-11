import type {DateTime} from "luxon";
import {useRuntimeConfig} from "#imports";

export async function fetchFromCmApi<T>(
    path: string,
    query: Record<string, string | number | boolean | string[] | DateTime | undefined | null>
): Promise<T> {
    const config = useRuntimeConfig();

    const {cmApiUrl, cmApiToken} = config;

    if (!cmApiUrl) {
        throw new Error('CM API URL is not defined');
    }

    if (!cmApiToken) {
        throw new Error('CM API Token is not defined');
    }

    const url = `${cmApiUrl}${path}`;

    return await $fetch(url, {
        query,
        headers: {
            Authorization: `Bearer ${cmApiToken}`,
        }
    });
}
