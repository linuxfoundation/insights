import type { Summary } from '~/components/shared/types/summary.types';

export interface MergeLeadTimeItem {
  value: number;
  unit: string;
  changeType: string;
}
export interface MergeLeadTime {
  summary: Summary;
  data: {
    pickup: MergeLeadTimeItem;
    review: MergeLeadTimeItem;
    accepted: MergeLeadTimeItem;
    prMerged: MergeLeadTimeItem;
  };
}
