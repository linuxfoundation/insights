import { axisLabelFormatter } from '../helpers/formatters';
import colors from '@/assets/constants/colors.json';

const defaultOption: ECOption = {
  xAxis: {
    type: 'category',
    axisLabel: {
      align: 'center',
      formatter: axisLabelFormatter,
      interval: 0,
      fontSize: '12px',
      fontWeight: 'normal',
      color: colors.neutral[400] // TODO: change this when we have the correct color
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
      color: colors.neutral[400],
      formatter: (value: number) => `${value === 0 ? '' : value}`
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: colors.neutral[200]
      },
      showMinLine: false
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

export default defaultOption;
