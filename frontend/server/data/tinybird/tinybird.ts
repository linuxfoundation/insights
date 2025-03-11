import {DateTime} from "luxon";
import {useRuntimeConfig} from "#imports";

export interface TinybirdResponse<T> {
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

// TinyBird requires dates to be in a specific format, otherwise it returns an error.
function formatDateForTinyBird(date: DateTime): string {
    return date.toFormat('yyyy-MM-dd 00:00:00') ?? '';
}

export async function fetchFromTinybird<T>(
    path: string,
    query: Record<string, string | number | boolean | string[] | DateTime | undefined>
): Promise<TinybirdResponse<T>> {
    const config = useRuntimeConfig();

    if (!config.tinybirdBaseUrl) {
        throw new Error('Tinybird base URL is not defined');
    }
    if (!config.tinybirdToken) {
        throw new Error('Tinybird token is not defined');
    }
    const url = `${config.tinybirdBaseUrl}${path}`;

    // We don't want to send undefined values to TinyBird, so we remove those from the query.
    // We also format DateTime objects so that TinyBird understands them.
    const processedQuery = Object.fromEntries(
      Object.entries(query)
        .filter(([_, value]) => (value !== undefined) && (value !== '') && (value !== null))
        .map(([key, value]) => [
            key,
            value instanceof DateTime
              ? formatDateForTinyBird(value)
              : value
        ])
    );

    return await $fetch(url, {
        query: processedQuery,
        headers: {
            Authorization: `Bearer ${config.tinybirdToken}`,
        }
    });
}
