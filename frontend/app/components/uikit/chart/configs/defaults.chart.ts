import type { GaugeSeriesOption } from 'echarts';
import { axisLabelFormatter } from '../helpers/formatters';
import type { CategoryData } from '../types/ChartTypes';
import { formatNumber } from '~/components/shared/utils/formatter';
import { lfxColors } from '~/config/styles/colors';

const defaultOption: ECOption = {
  grid: {
    left: '8%',
    right: 0
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      align: 'center',
      formatter: axisLabelFormatter('{MMM} {yy}'),
      hideOverlap: true,
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400] // TODO: change this when we have the correct color
      // the designs are currently using a color hex not defined in the design system
    },
    axisLine: {
      show: false
    },
    splitLine: { show: false },
    axisTick: { show: false }
  },
  yAxis: {
    alignTicks: true,
    axisLabel: {
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400],
      formatter: (value: number) => `${value === 0 ? '' : formatNumber(value)}`
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: lfxColors.neutral[200]
      },
      showMinLine: false,
      show: true
    }
    // max: (value: { min: number; max: number }) => {
    //   console.log(value.max, value.min);
    //   return value.max + value.min;
    // } //(value.max - value.min)
  }
};

export const defaultGraphOnlyOption: ECOption = {
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLabel: {
      show: false
    },
    axisLine: {
      show: false
    },
    splitLine: { show: false },
    axisTick: { show: false }
  },
  yAxis: {
    show: false
  }
};

export const defaultGaugeSeriesStyle: GaugeSeriesOption = {
  type: 'gauge',
  pointer: {
    show: false
  },
  progress: {
    show: true,
    overlap: false,
    roundCap: true,
    clip: false
  },
  axisLine: {
    lineStyle: {
      width: 8,
    }
  },
  splitLine: {
    show: false,
    distance: 0,
    length: 10
  },
  axisTick: {
    show: false
  },
  axisLabel: {
    show: false,
    distance: 50
  }
};

export const categoryData: CategoryData = {
  xAxis: [
    { key: 'Mon', value: 0 },
    { key: 'Tue', value: 1 },
    { key: 'Wed', value: 2 },
    { key: 'Thu', value: 3 },
    { key: 'Fri', value: 4 },
    { key: 'Sat', value: 5 },
    { key: 'Sun', value: 6 }
  ],
  yAxis: [
    { key: '8:00', value: 8 },
    { key: '10:00', value: 10 },
    { key: '12:00', value: 12 },
    { key: '14:00', value: 14 },
    { key: '16:00', value: 16 },
    { key: '18:00', value: 18 },
    { key: '20:00', value: 20 },
    { key: '22:00', value: 22 },
    { key: '0:00+1', value: 0 },
    { key: '2:00+1', value: 2 },
    { key: '4:00+1', value: 4 },
    { key: '6:00+1', value: 6 }
  ]
};

export default defaultOption;
