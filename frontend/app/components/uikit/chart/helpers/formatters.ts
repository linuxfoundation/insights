import type {
  CallbackDataParams,
  TopLevelFormatterParams
} from 'echarts/types/dist/shared';
import { DateTime } from 'luxon';
import type {
  MultipleTooltipFormatterParams,
  SingleTooltipFormatterParams
} from '../types/EChartTypes';
import type { ChartData } from '../types/ChartTypes';
import { Granularity } from '~~/types/shared/granularity';
import { formatNumber } from '~/components/shared/utils/formatter';
import { lfxColors } from '~/config/styles/colors';

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
const formatIsoDate = (value: string, format: string) => {
  const dt = DateTime.fromISO(value);
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

// charts tooltip can't use tailwind classes, so we need to use inline styles
const tooltipSingleValue = (params: SingleTooltipFormatterParams) => `
  <div style="display: flex; 
    flex-direction: row; 
    align-items: center; 
    justify-content: space-between;
    min-width: 150px;
    font-weight: 400;
  ">
    <span style="font-weight: 400;">${params.seriesName}</span>
    <span style="font-weight: 500;">${formatNumber(Number(params.value))}</span>
  </div>
  `;

export const tooltipFormatter = (
  paramsRaw: TopLevelFormatterParams // Tooltip hover box
): string | HTMLElement | HTMLElement[] => {
  const params: MultipleTooltipFormatterParams = paramsRaw as MultipleTooltipFormatterParams;
  return `<div style="color: ${lfxColors.neutral[400]};">${formatDate(
    params[0]?.name || '',
    '{MMM} {yyyy}'
  )}</div>${params.map(tooltipSingleValue).join('')}`;
};

const formatDateRange = (
  startDateMillis: string,
  endDateIso: string,
  granularity: string
) => {
  switch (granularity) {
    case Granularity.WEEKLY:
    case Granularity.QUARTERLY:
      return `${formatDate(startDateMillis, 'MMM d')} - ${formatIsoDate(
        endDateIso,
        'MMM d'
      )}`;
    case Granularity.MONTHLY:
      return `${formatDate(startDateMillis, 'MMM yyyy')}`;
    case Granularity.YEARLY:
      return `${formatDate(startDateMillis, 'yyyy')}`;
    default:
      return `${formatDate(startDateMillis, 'MMM d, yyyy')}`;
  }
};

export const tooltipFormatterWithData = (data: ChartData[], granularity: string) => (
    paramsRaw: TopLevelFormatterParams // Tooltip hover box
  ): string | HTMLElement | HTMLElement[] => {
    const params: MultipleTooltipFormatterParams = paramsRaw as MultipleTooltipFormatterParams;
    const index = params[0]?.dataIndex || 0;

    const dateStr = `<div style="color: ${lfxColors.neutral[400]};">${formatDateRange(
      params[0]?.name || '',
      data?.[index]?.xAxisKey2 || '',
      granularity
    )}</div>`;

    return `${dateStr}${params.map(tooltipSingleValue).join('')}`;
  };
export const punchCardFormatter = (
  paramsRaw: TopLevelFormatterParams // Tooltip hover box
): string | HTMLElement | HTMLElement[] => {
  const params: SingleTooltipFormatterParams = paramsRaw as SingleTooltipFormatterParams;

  return `${(params.data as number[])[2]} ${params.seriesName}`;
};
