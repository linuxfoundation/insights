// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import _ from 'lodash';
import type { EChartsOption as ECOption } from 'echarts';
import type {
  TooltipOption,
  TooltipFormatterCallback as TFCallback,
  TopLevelFormatterParams as TLPParams,
} from 'echarts/types/dist/shared';
import type { TreeMapData } from '../types/ChartTypes';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber, formatNumberCurrency } from '~/components/shared/utils/formatter';
import type { TreeLabelFormatterParams } from '~/components/uikit/chart/types/EChartTypes';

const visualMin = 1;
const visualMax = 5;
const LABEL_OFFSET = [12, 12];
const LABEL_PADDING = [0, 12, 10, 0];
const LABEL_PADDING_SMALL = [0, 20, 10, 0];

export const LABEL_STYLE_DEFAULT = {
  a: {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'Inter',
    color: lfxColors.neutral[900],
    lineHeight: 24,
  },
  b: {
    fontSize: '24px',
    fontWeight: 600,
    fontFamily: 'Inter',
    color: lfxColors.neutral[900],
    lineHeight: 40,
  },
  c: {
    fontSize: '12px',
    fontWeight: 400,
    fontFamily: 'Inter',
    color: lfxColors.neutral[900],
    opacity: 0.5,
  },
};
export const LABEL_STYLE_MEDIUM = {
  a: {
    ...LABEL_STYLE_DEFAULT.a,
    fontSize: '12px',
    lineHeight: 18,
  },
  b: {
    ...LABEL_STYLE_DEFAULT.b,
    fontSize: '20px',
    lineHeight: 36,
  },
  c: {
    ...LABEL_STYLE_DEFAULT.c,
  },
};
export const LABEL_STYLE_SMALL = {
  a: {
    ...LABEL_STYLE_DEFAULT.a,
    fontSize: '12px',
    lineHeight: 18,
  },
  b: {
    ...LABEL_STYLE_DEFAULT.b,
    fontSize: '16px',
    lineHeight: 28,
  },
  c: {
    ...LABEL_STYLE_DEFAULT.c,
  },
};

const dataStyles = [
  {
    color: lfxColors.neutral[50],
    hover: '#ECEDEF',
    additionalStyles: {
      borderColor: lfxColors.neutral[300],
      borderWidth: 1,
    },
    labelStyles: {
      padding: LABEL_PADDING_SMALL,
      rich: LABEL_STYLE_SMALL,
    },
  },
  {
    color: lfxColors.brand[50],
    hover: '#DFE9F2',
    labelStyles: {
      rich: LABEL_STYLE_MEDIUM,
    },
  },
  {
    color: lfxColors.brand[100],
    hover: '#CBDFF2',
  },
  {
    color: lfxColors.brand[200],
    hover: '#A4CBF2',
  },
  {
    color: lfxColors.brand[300],
    hover: '#7CB7F2',
  },
];

const labelFormatter = (params: TreeLabelFormatterParams) => {
  const { name, value, seriesName } = params;
  // const seriesNameParts = seriesName.split('|');
  // const seriesNamePart = seriesNameParts[seriesNameParts.length - 1];
  return `{a|${name}}\n{b|${formatNumber(Number(value[0]))}}\n{c|${seriesName}}`;
};

const labelFormatterCurrency = (params: TreeLabelFormatterParams) => {
  const { name, value, seriesName } = params;
  return `{a|${name}}\n{b|${formatNumberCurrency(Number(value[0]), 'USD')}+}\n{c|${seriesName}}`;
};

const LABEL_DEFAULT = {
  show: true,
  formatter: labelFormatter,
  offset: LABEL_OFFSET,
  padding: LABEL_PADDING,
  rich: LABEL_STYLE_DEFAULT,
  color: lfxColors.neutral[900],
};

const SERIES_DEFAULT = {
  name: 'Contributors',
  top: 0,
  width: '100%',
  height: '100%',
  type: 'treemap',
  breadcrumb: {
    show: false,
  },
  label: LABEL_DEFAULT,
  roam: false, // prevents scrolling and zooming
  // roam: 'scale',
  //   scaleLimit: {
  //     min: 1,
  //     max: 10
  // },
  nodeClick: false, // 'link', // prevent focus on click
  visualMin, // minimum value for color mapping
  visualMax, // maximum value for color mapping
  visualDimension: 1, // dimension of the visual map (values should be in array)
  // the second value in the array determines the color of the node
  // data needs to be normalized to the visual min and max
  levels: [
    {
      colorMappingBy: 'value',
      itemStyle: {
        gapWidth: 4,
      },
    },
    {
      itemStyle: {
        borderRadius: 4,
        gapWidth: 4,
      },
    },
  ],
};

const SERIES_CURRENCY = {
  ...SERIES_DEFAULT,
  name: 'Software Value',
  label: {
    ...SERIES_DEFAULT.label,
    formatter: labelFormatterCurrency,
  },
};

const defaultTreeMapOption: ECOption = {
  tooltip: {
    borderColor: lfxColors.neutral[100],
    borderWidth: 1,
    trigger: 'item',
    confine: true,
  },
  series: [SERIES_DEFAULT] as ECOption['series'],
};

const mapDataStyles = (data: TreeMapData[]) => data.map((item) => {
    const style = dataStyles[item.value[1]];
    return {
      ...item,
      itemStyle: {
        color: style?.color,
        ...style?.additionalStyles,
      },
      emphasis: {
        itemStyle: {
          color: style?.hover,
        },
      },
      label: style?.labelStyles,
    };
  });

/**
 * Get tree map config. This function takes in the data and series and returns the chart config.
 * @param data - Data
 * @param tooltipFormatter - Tooltip formatter
 * @param options - Options
 * @returns Chart config
 */
export const getTreeMapConfig = (
  data: TreeMapData[],
  tooltipFormatter: (info: TreeLabelFormatterParams) => string,
  isValueCurrency: boolean,
  options?: ECOption
): ECOption => {
  const treeMapOption = _.merge({}, defaultTreeMapOption, {
    series: [isValueCurrency ? SERIES_CURRENCY : SERIES_DEFAULT] as ECOption['series'],
  });
  console.log('!!!treeMapOption', treeMapOption);

  const config = _.merge({}, treeMapOption, options);
  if (config.tooltip) {
    const cfgTooltip = config.tooltip as TooltipOption;
    cfgTooltip.formatter = tooltipFormatter as unknown as TFCallback<TLPParams>;
  }
  if (Array.isArray(config.series) && config.series.length > 0 && config.series[0]) {
    config.series[0].data = mapDataStyles(data);
  }
  return config;
};
