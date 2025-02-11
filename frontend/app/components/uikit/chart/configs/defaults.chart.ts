import type { GaugeSeriesOption } from 'echarts';
import { axisLabelFormatter } from '../helpers/formatters';
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
      interval: 0,
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
      formatter: (value: number) => `${value === 0 ? '' : value}`
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: lfxColors.neutral[200]
      },
      showMinLine: false,
      show: true
    }
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
      width: 10
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

export default defaultOption;
