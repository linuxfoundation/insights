export interface GeoMapData {
  name: string;
  code: string;
  flag: string;
  count: number;
  percentage: number;
}

export interface GeoMapSummary {
  totalContributions: number;
  periodFrom: string;
  periodTo: string;
}

export interface GeoMapResponse {
  summary: GeoMapSummary;
  data: GeoMapData[];
}
