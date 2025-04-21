import type {DateTime} from "luxon";
import type {ActivityPlatforms} from "~~/types/shared/activity-platforms";
import type {ActivityTypes} from "~~/types/shared/activity-types";

export type ContributorsLeaderboardTinybirdQuery = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  repo?: string;
  limit?: number;
  offset?: number;
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type OrganizationsLeaderboardTinybirdQuery = {
  project: string;
  platform?: ActivityPlatforms;
  activity_type?: ActivityTypes;
  activity_types?: ActivityTypes[];
  repo?: string;
  limit?: number;
  offset?: number;
  count?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
}

export type ActivityHeatmapByWeekdayTBQuery = {
  project: string;
  repo?: string,
  startDate: DateTime,
  endDate: DateTime,
};
