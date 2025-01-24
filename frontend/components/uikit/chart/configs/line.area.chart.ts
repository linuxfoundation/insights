import { buildSeries, buildYAxis, convertDateData } from '../helpers/chart-helpers';

import { axisLabelFormatter, tooltipFormatter, tooltipLabelFormatter } from '../helpers/formatters';
import type { ChartData, ChartSeries } from '../types/ChartTypes';

const defaultOption: ECOption = {
  xAxis: {
    type: 'category',
    axisTick: {
      alignWithLabel: true
    },
    axisLabel: {
      formatter: axisLabelFormatter,
      interval: 0
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        formatter: tooltipLabelFormatter
      }
    },
    formatter: tooltipFormatter
  }
};

export const getLineAreaChartConfig = (data: ChartData[], series: ChartSeries[]): ECOption => {
  const xAxis = { ...defaultOption.xAxis, data: convertDateData(data) ?? [] };
  return {
    ...defaultOption,
    xAxis,
    yAxis: buildYAxis(series),
    series: buildSeries(series, data)
  };
};
