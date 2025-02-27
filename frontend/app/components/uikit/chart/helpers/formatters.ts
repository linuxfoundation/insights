import type {
  CallbackDataParams,
  TopLevelFormatterParams
} from 'echarts/types/dist/shared';
import { DateTime } from 'luxon';
import type {
  MultipleTooltipFormatterParams,
  SingleTooltipFormatterParams
} from '../types/EChartTypes';

declare type LabelFormatterParams = {
  value: number | string | Date;
  axisDimension: string;
  axisIndex: number;
  seriesData: CallbackDataParams[];
};

// TODO: move this to a datetime utils file
const formatDate = (value: string, format: string) => {
  const dt = DateTime.fromMillis(parseInt(value, 10));
  // const dt = DateTime.fromISO(value);
  // Convert echarts format to luxon format
  const luxonFormat = format.replace(/\{([^}]+)\}/g, '$1');

  return dt.toFormat(luxonFormat);
};

export const axisLabelFormatter = (format: string) => (value: string) => formatDate(value, format);

export const tooltipLabelFormatter = (params: LabelFormatterParams) => {
  if (params.axisDimension === 'x') {
    return formatDate(params.value as string, '{MMM} {yyyy}');
  }
  return parseInt(params.value as string, 10).toString();
};

const tooltipSingleValue = (params: SingleTooltipFormatterParams) => `${params.seriesName}: ${params.value} <br>`;

export const tooltipFormatter = (
  paramsRaw: TopLevelFormatterParams // Tooltip hover box
): string | HTMLElement | HTMLElement[] => {
  const params: MultipleTooltipFormatterParams = paramsRaw as MultipleTooltipFormatterParams;
  return `${formatDate(params[0]?.name || '', '{MMM} {yyyy}')}<br>${params
    .map(tooltipSingleValue)
    .join('')}`;
};

export const punchCardFormatter = (
  paramsRaw: TopLevelFormatterParams // Tooltip hover box
): string | HTMLElement | HTMLElement[] => {
  const params: SingleTooltipFormatterParams = paramsRaw as SingleTooltipFormatterParams;

  return `${(params.data as number[])[2]} ${params.seriesName}`;
};
