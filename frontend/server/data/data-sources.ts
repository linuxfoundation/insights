// This creates a Tinybird data source for fetching active contributors' data.
// If we ever need to change the data source, we can do it here, and we won't have to change the API code.

import type {ActiveContributorsFilter, ContributorsLeaderboardFilter} from "~~/server/data/types";
import type {ActiveContributorsResponse} from "~~/server/data/tinybird/active-contributors-data-source";
import type {ContributorsLeaderboardResponse} from "~~/server/data/tinybird/contributors-leaderboard-source";

import {fetchActiveContributors} from "~~/server/data/tinybird/active-contributors-data-source";
import {fetchContributorsLeaderboard} from "~~/server/data/tinybird/contributors-leaderboard-source";

export interface DataSource {
    fetchActiveContributors: (filter: ActiveContributorsFilter) => Promise<ActiveContributorsResponse>;
    fetchContributorsLeaderboard: (filter: ContributorsLeaderboardFilter) => Promise<ContributorsLeaderboardResponse>;
}

export function createDataSource(): DataSource {
    return {
        fetchActiveContributors,
        fetchContributorsLeaderboard
    };
}
