// This creates a Tinybird data source for fetching active contributors' data.
// If we ever need to change the data source, we can do it here, and we won't have to change the API code.

import type {ActiveContributorsFilter} from "~~/server/data/types";
import type {ActiveContributorsResponse} from "~~/server/data/tinybird/active-contributors-data-source";

import {fetchActiveContributors} from "~~/server/data/tinybird/active-contributors-data-source";

export interface DataSource {
    fetchActiveContributors: (filter: ActiveContributorsFilter) => Promise<ActiveContributorsResponse>;
}

export function createDataSource(): DataSource {
    return {
        fetchActiveContributors
    };
}
