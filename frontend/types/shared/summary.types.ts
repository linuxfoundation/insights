export interface Summary {
  current: number;
  previous: number;
  percentageChange: number | undefined;
  changeValue: number;
  periodFrom: string;
  periodTo: string;
}

export interface Meta {
  offset: number;
  limit: number;
  total: number;
}
