import type {DateTime} from "luxon";

export type FetchFunction = typeof $fetch;

export enum ContributorsFilterGranularity {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export type ActiveContributorsFilter = {
  project: string;
  repo?: string;
  granularity?: ContributorsFilterGranularity;
  fromDate?: DateTime;
  toDate?: DateTime;
};

// This probably shouldn't be here.
// It represents the format the API should return, but the data layer shouldn't know about the API layer.
export type ActiveContributorsDataPoint = {
  fromDate: string;
  toDate: string;
  contributors: number;
};
export type ActiveContributorsResponseData = ActiveContributorsDataPoint[];
export type ActiveContributorsResponse = {
  summary: {
    current: number; // Current number of active contributors
    previous: number; // Previous number of active contributors
    percentageChange: number; // Percentage change in active contributors
    changeValue: number; // Change in the number of active contributors
    periodFrom: DateTime; // Start of the period (e.g. last 90 days)
    periodTo: DateTime; // End of the period (e.g. last 90 days)
  };
  data: ActiveContributorsResponseData
};
