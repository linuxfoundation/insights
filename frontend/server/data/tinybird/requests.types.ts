import type {DateTime} from "luxon";

export type ActivityHeatmapByWeekdayTBQuery = {
  project: string;
  repo?: string,
  startDate: DateTime,
  endDate: DateTime,
};
