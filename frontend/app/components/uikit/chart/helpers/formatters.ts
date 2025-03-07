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
import { Granularity } from '~/components/shared/types/granularity';
import { formatNumber } from '~/components/shared/utils/formatter';

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
  ">
    <span>${params.seriesName}</span>
    <span>${formatNumber(Number(params.value))}</span>
  </div>
  `;

export const tooltipFormatter = (
  paramsRaw: TopLevelFormatterParams // Tooltip hover box
): string | HTMLElement | HTMLElement[] => {
  const params: MultipleTooltipFormatterParams = paramsRaw as MultipleTooltipFormatterParams;
  return `${formatDate(params[0]?.name || '', '{MMM} {yyyy}')}<br>${params
    .map(tooltipSingleValue)
    .join('')}`;
};

const formatDateRange = (
  startDateMillis: string,
  endDateIso: string,
  granularity: string
) => {
  switch (granularity) {
    case Granularity.Weekly:
    case Granularity.Quarterly:
      return `${formatDate(startDateMillis, 'MMM d')} - ${formatIsoDate(
        endDateIso,
        'MMM d'
      )}`;
    case Granularity.Monthly:
      return `${formatDate(startDateMillis, 'MMM yyyy')}`;
    case Granularity.Yearly:
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

    const dateStr = formatDateRange(
      params[0]?.name || '',
      data?.[index]?.xAxisKey2 || '',
      granularity
    );

    return `${dateStr}<br>${params.map(tooltipSingleValue).join('')}`;
  };
export const punchCardFormatter = (
  paramsRaw: TopLevelFormatterParams // Tooltip hover box
): string | HTMLElement | HTMLElement[] => {
  const params: SingleTooltipFormatterParams = paramsRaw as SingleTooltipFormatterParams;

  return `${(params.data as number[])[2]} ${params.seriesName}`;
};
