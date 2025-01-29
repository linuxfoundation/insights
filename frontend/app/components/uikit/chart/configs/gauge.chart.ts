import type { GaugeSeriesOption } from 'echarts';
import type { GaugeData } from '../types/ChartTypes';
import { defaultGaugeSeriesStyle } from './defaults.chart';
import { lfxColors } from '~/components/config/styles/colors';

// Not inheriting the default chart options here
const halfSeriesStyle: GaugeSeriesOption = {
  ...defaultGaugeSeriesStyle,
  startAngle: 180,
  endAngle: 0,
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
    fontFamily: 'Inter',
    color: lfxColors.black
  }
};

const fullSeriesStyle: GaugeSeriesOption = {
  ...defaultGaugeSeriesStyle,
  startAngle: 90,
  endAngle: -270,
  axisLine: {
    lineStyle: {
      width: 5
    }
  },
  detail: {
    fontSize: '24px',
    fontFamily: 'Inter',
    color: lfxColors.black
  }
};

const halfDataOpts = {
  title: {
    offsetCenter: ['0%', '0%']
  },
  detail: {
    valueAnimation: true,
    offsetCenter: ['-10%', '-30%']
  }
};

const fullDataOpts = {
  title: {
    offsetCenter: ['0%', '0%']
  },
  detail: {
    valueAnimation: true,
    offsetCenter: ['-18%', '5%']
  }
};

const getMaxLabelElem = (value: number, maxVal?: number, gaugeType: 'half' | 'full' = 'half') => {
  const maxValue = maxVal || 100;
  const halfLeftPadding = [5, 15, 40][value.toString().length - 1];
  const fullLeftPadding = [5, 10, 13][value.toString().length - 1];

  return {
    type: 'text',
    left: '50%',
    top: gaugeType === 'half' ? '38%' : '50%',
    style: {
      text: `/${maxValue}`, // ${space}/
      fontSize: gaugeType === 'half' ? '20px' : '8px',
      fontFamily: 'Inter',
      padding: gaugeType === 'half' ? [0, 4, 0, halfLeftPadding] : [0, 0, 0, fullLeftPadding],
      borderWidth: 1,
      borderColor: 'transparent',
      fill: lfxColors.neutral[400],
      fontWeight: 400
    }
  };
};

/**
 * Get heat map chart config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param series - Series
 * @returns Chart config
 */
export const getGaugeChartConfig = (data: GaugeData): ECOption => {
  const gaugeSeries = { ...(data.gaugeType === 'half' ? halfSeriesStyle : fullSeriesStyle) };
  gaugeSeries.title = { ...gaugeSeries.title, backgroundColor: data.color || lfxColors.brand[500] };
  // data.name === '' ? undefined : ;
  gaugeSeries.data = [
    {
      value: data.value,
      name: data.name,
      ...(data.gaugeType === 'half' ? halfDataOpts : fullDataOpts)
    }
  ];

  return {
    series: [gaugeSeries],
    graphic: {
      // TODO: Find a better way to do this
      elements: [getMaxLabelElem(data.value, data.maxValue, data.gaugeType)]
    }
  };
};
