export interface ChartSeries {
  name: string;
  type: string;
  yAxisIndex: number;
  dataIndex: number;
  position?: 'left' | 'right';
}

export interface ChartData {
  date: string;
  values: number[];
}
