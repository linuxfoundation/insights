import type { Summary } from '~/components/shared/types/summary.types';

export interface ContributionOutsideHours {
  summary: Summary;
  weekdayOutsideHoursPercentage: number;
  weekendOutsideHoursPercentage: number;
  data: {
    day: string;
    hour: string;
    contributions: number;
  }[];
}
