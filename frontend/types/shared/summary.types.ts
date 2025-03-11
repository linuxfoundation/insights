export interface Summary {
  current: number;
  previous: number;
  percentageChange: number;
  changeValue: number;
  periodFrom: string;
  periodTo: string;
}

export interface Meta {
  offset: number;
  limit: number;
  total: number;
}
