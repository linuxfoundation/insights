// This creates a Tinybird data source for fetching active contributors' data.
// If we ever need to change the data source, we can do it here, and we won't have to change the API code.

import type {ActiveContributorsResponse, ActiveContributorsFilter} from "~~/server/data/types";
import {createTinybirdDataSource} from "~~/server/data/tinybird/active-contributors-data-source";

export interface ContributorsDataSource {
    fetchActiveContributors: (filter: ActiveContributorsFilter) => Promise<ActiveContributorsResponse>;
}

export function createActiveContributorsDataSource(): ContributorsDataSource {
    return createTinybirdDataSource();
}
