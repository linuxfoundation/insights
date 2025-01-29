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
    color: lfxColors.black,
    formatter: '{a|{value}}{b|/100}',
    rich: {
      a: {
        fontSize: '60px',
        fontWeight: 500,
        fontFamily: 'Inter',
        color: lfxColors.black,
        align: 'center',
        padding: [0, 5, 0, 0]
      },
      b: {
        fontSize: '20px',
        fontWeight: 400,
        fontFamily: 'Inter',
        align: 'center',
        color: lfxColors.black,
        padding: [40, 0, 20, 0]
      }
    }
  }
};

const halfDetail: GaugeSeriesOption['detail'] = {
  color: lfxColors.black,
  formatter: '{a|{value}}{b|/100}',
  rich: {
    a: {
      fontSize: '60px',
      fontWeight: 500,
      fontFamily: 'Inter',
      color: lfxColors.black,
      align: 'center',
      padding: [0, 5, 0, 0]
    },
    b: {
      fontSize: '20px',
      fontWeight: 400,
      fontFamily: 'Inter',
      align: 'center',
      color: lfxColors.black,
      padding: [40, 0, 20, 0]
    }
  }
};

const fullDetail: GaugeSeriesOption['detail'] = {
  formatter: '{a|{value}}{b|/100}',
  rich: {
    a: {
      fontSize: '24px',
      fontWeight: 600,
      fontFamily: 'Inter',
      align: 'center',
      padding: [0, 5, 0, 0]
    },
    b: {
      fontSize: '8px',
      fontWeight: 400,
      fontFamily: 'Inter',
      align: 'center',
      padding: [25, 0, 20, 0]
    }
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
    offsetCenter: ['0%', '-30%']
  }
};

const fullDataOpts = {
  title: {
    offsetCenter: ['0%', '0%']
  },
  detail: {
    valueAnimation: true,
    offsetCenter: ['0%', '0%']
  }
};

/**
 * Get gauge chart config. This function generates the configuration for half or full gauge charts.
 * @param data - GaugeData containing value, name, gaugeType, color, and optional maxValue
 * @returns Chart config
 */
export const getGaugeChartConfig = (data: GaugeData): ECOption => {
  const gaugeSeries = { ...(data.gaugeType === 'half' ? halfSeriesStyle : fullSeriesStyle) };
  gaugeSeries.detail = {
    ...(data.gaugeType === 'half' ? halfDetail : fullDetail),
    formatter: `{a|{value}}{b|/${data.maxValue || 100}}`
  };
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
    series: [gaugeSeries]
  };
};
