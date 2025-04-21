// These are the types of the responses from the Tinybird API

export type TinybirdActiveContributorsSummary = {
  contributorCount: number;
}[];

export type TinybirdActiveContributorsData = {
  startDate: string;
  endDate: string;
  contributorCount: number;
}[];

export type TinybirdContributorsLeaderboardData = {
  avatar: string,
  displayName: string,
  contributionCount: number,
  contributionPercentage: number
};

export type TinybirdContributorDependencyData = {
  displayName: string,
  contributionPercentage: number,
  contributionPercentageRunningTotal: number,
  totalContributorCount: number
};

export type TinybirdActivityHeatmapData = {
  weekday: number,
  twoHoursBlock: number,
  activityCount: number
};
