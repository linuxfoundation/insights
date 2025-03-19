import type {
  CallbackDataParams,
  TopLevelFormatterParams
} from 'echarts/types/dist/shared';
import { DateTime } from 'luxon';
import type {
  MultipleTooltipFormatterParams,
  SingleTooltipFormatterParams
} from '../types/EChartTypes';
import type { ChartData, ChartSeries } from '../types/ChartTypes';
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
    font-size: 12px;
     color: ${lfxColors.neutral[900]}
  ">
    <span style="font-weight: 400;">${params.seriesName}</span>
    <span style="font-weight: 500;">${formatNumber(Number(params.value))}</span>
  </div>
  `;

const tooltipSingleValueWithBullet = (series: ChartSeries[]) => (params: SingleTooltipFormatterParams, idx: number) => `
  <div style="display: flex; 
    flex-direction: row; 
    align-items: center; 
    justify-content: space-between;
    min-width: 180px;
    font-weight: 400;
    font-size: 12px;
     color: ${lfxColors.neutral[900]}
  ">
    <span style="font-weight: 400;">
      <span style="background-color: ${series[idx]?.color || lfxColors.brand[500]}; 
        display: inline-block;
        border-radius: 100%; 
        height: 8px;
        width: 8px;
        margin-right: 4px;"></span>
      ${params.seriesName}
    </span>
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

export const tooltipFormatterWithData = (data: ChartData[], granularity: string, series?: ChartSeries[]) => (
    paramsRaw: TopLevelFormatterParams // Tooltip hover box
  ): string | HTMLElement | HTMLElement[] => {
    const params: MultipleTooltipFormatterParams = paramsRaw as MultipleTooltipFormatterParams;
    const index = params[0]?.dataIndex || 0;

    const dateStr = `<div style="font-size: 12px; color: ${
      lfxColors.neutral[400]
    };">${formatDateRange(
      params[0]?.name || '',
      data?.[index]?.xAxisKey2 || '',
      granularity
    )}</div>`;
    return `${dateStr}${params
      .map(
        series && series.length > 1
          ? tooltipSingleValueWithBullet(series)
          : tooltipSingleValue
      )
      .join('')}`;
  };
export const punchCardFormatter = (granularity: string) => (
    paramsRaw: TopLevelFormatterParams // Tooltip hover box
  ): string | HTMLElement | HTMLElement[] => {
    const params: SingleTooltipFormatterParams = paramsRaw as SingleTooltipFormatterParams;
    const data = params.data as number[];
    const dateStr = `<div style="font-size: 12px; color: ${lfxColors.neutral[400]};">${
      granularity.charAt(0).toUpperCase() + granularity.slice(1)
    } ${data[0]}</div>`;

    const valueStr = `<div style="
      color: ${lfxColors.neutral[900]}; 
      font-size: 12px; 
      min-width: 180px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;">
    <span style="font-weight: 400;">${params.seriesName}</span>
   <span style="font-weight: 500;"> ${data[2]}</span>
   </div>`;
    return `${dateStr} ${valueStr}`;
  };
