import type { Summary } from '~/components/shared/types/summary.types';

export interface ContributionOutsideHours {
  summary: Summary;
  data: {
    DAY: string;
    HOUR: string;
    COMMITS: number;
  }[];
}
