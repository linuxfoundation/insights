import type { GaugeSeriesOption } from 'echarts';
import type { GaugeData } from '../types/ChartTypes';
import { lfxColors } from '~/components/config/styles/colors';

// Not inheriting the default chart options here
const defaultSeriesStyle: GaugeSeriesOption = {
  type: 'gauge',
  startAngle: 180,
  endAngle: 0,
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
  },
  title: {
    width: 80,
    height: 20,
    fontSize: '14px',
    borderColor: 'inherit',
    backgroundColor: 'inherit',
    borderRadius: 20,
    borderWidth: 0,
    fontFamily: 'Inter',
    color: lfxColors.white
  },
  detail: {
    fontSize: '60px',
    color: lfxColors.black
    // formatter: '{value}%'
  }
};

/**
 * Get heat map chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getGaugeChartConfig = (data: GaugeData): ECOption => {
  const gaugeSeries = { ...defaultSeriesStyle };
  gaugeSeries.title = { ...defaultSeriesStyle.title, backgroundColor: data.color || lfxColors.brand[500] };
  gaugeSeries.data = [
    {
      value: data.value,
      name: data.name,
      title: {
        offsetCenter: ['0%', '0%']
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ['-10%', '-30%']
      }
    }
  ];

  const maxValue = data.maxValue || 100;
  const space = Array(data.value.toString().length - 1)
    .fill('     ')
    .join('');

  return {
    series: [gaugeSeries],
    graphic: {
      // TODO: Find a better way to do this
      elements: [
        {
          type: 'text',
          left: '50%',
          top: '40%',
          style: {
            text: `${space}/${maxValue}`,
            font: '20px Inter',
            padding: [0, 175, 4, 0],
            borderWidth: 1,
            borderColor: 'transparent',
            fill: lfxColors.neutral[400],
            fontWeight: 400
          }
        }
      ]
    }
  };
};
