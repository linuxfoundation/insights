// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ofetch } from 'ofetch';

interface KeywordData {
    vol: number;
    cpc: {
        value: number;
        currency: string;
    };
    competition: number;
    trend: Array<{
        month: string;
        year: string;
        value: number;
    }>;
}

interface KeywordsEverywhereResponse {
    credits?: number;
    credits_consumed?: number;
    data?: Array<{
        keyword: string;
        vol?: number;
        cpc?: number | { value: number; currency: string };
        competition?: number;
        trend?: Array<{ month: string; year: string; value: number }>;
    }>;
}

const DEFAULT_API_URL = "https://api.keywordseverywhere.com/v1/get_keyword_data";

function getDefaultApiKey(): string | undefined {
    return process.env.KEYWORDS_EVERYWHERE_API_KEY;
}

console.log(`API_KEY: ${getDefaultApiKey() ? 'Loaded' : 'Not Loaded'}`);

interface GetSearchVolumeOptions {
    fetcher?: typeof ofetch;
    apiKey?: string;
    apiUrl?: string;
}

/**
 * Fetches monthly search volume data for a list of keywords using the Keywords Everywhere API.
 *
 * @param keywords - A list of keyword strings.
 * @param options - Optional configuration for the API call, including fetcher, apiKey, and apiUrl.
 * @returns A promise that resolves to the API response data, typically mapping keywords
 * to their volume, CPC, competition, and trend data. Returns null if the API
 * call fails.
 */
async function getSearchVolume(
    keywords: string[],
    options: GetSearchVolumeOptions = {}
): Promise<KeywordsEverywhereResponse | null> {
    const {
        fetcher = ofetch,
        apiKey = getDefaultApiKey(),
        apiUrl = DEFAULT_API_URL
    } = options;

    if (!apiKey) {
        console.error("KEYWORDS_EVERYWHERE_API_KEY not found.");
        throw new Error("KEYWORDS_EVERYWHERE_API_KEY not found.");
    }

    if (!keywords || keywords.length === 0) {
        return {data: []}; // Return empty data if no keywords provided
    }

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const body = {
        'kw': keywords,
        'country': 'us',
        'currency': 'USD',
        'dataSource': 'gkp' // Default to Google Keyword Planner data
    }

    try {
        const result = await fetcher<KeywordsEverywhereResponse>(apiUrl, {
            method: 'POST',
            headers,
            body,
            timeout: 60000, // Increased timeout to 60 seconds
        });

        console.log(`API call successful. Credits consumed: ${result.credits_consumed ?? 'N/A'}, Credits remaining: ${result.credits ?? 'N/A'}`);
        return result;
    } catch (error: any) {
        console.error("Error calling Keywords Everywhere API:", error);
        console.error("Original error", error.data);
        return null;
    }
}

export { getSearchVolume };
