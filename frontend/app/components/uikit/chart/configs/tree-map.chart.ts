// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import { merge } from 'lodash';
import { lfxColors } from '~/config/styles/colors';
import { formatNumber } from '~/components/shared/utils/formatter';

const visualMin = 1;
const visualMax = 5;

export type TreeLabelFormatterParams = {
  seriesName: string;
  name: string;
  value: number[];
  borderColor: string;
  color: string;
  componentIndex: number;
  componentSubType: string;
  componentType: string;
  data: {
    value: number[];
    name: string;
    id: string;
  };
  dataIndex: number;
  dimensionNames: [];
  encode: { value: number[] };
  seriesId: string;
  seriesIndex: number;
  seriesType: string;
  status: string;
};

export interface TreeMapItem {
  id: string;
  name: string;
  count: number;
  softwareValue?: string;
  logoUrl?: string;
  icon?: string;
}

export interface TreeMapData {
  id: string;
  name: string;
  value: [number, number];
  softwareValue?: string;
  topProjects: TreeMapItem[];
  topCollections: TreeMapItem[];
  link?: string;
  target?: string;
}

const labelFormatter = (params: TreeLabelFormatterParams) => {
  const { name, value, seriesName } = params;
  // const seriesNameParts = seriesName.split('|');
  // const seriesNamePart = seriesNameParts[seriesNameParts.length - 1];
  return `{a|${name}}\n{b|${formatNumber(Number(value[0]))}}\n{c|${seriesName}}`;
};
const defaultTreeMapOption: ECOption = {
  tooltip: {
    borderColor: lfxColors.neutral[100],
    borderWidth: 1,
    trigger: 'item',
    confine: true
  },
  series: [
    {
      name: 'Contributors',
      top: 0,
      width: '100%',
      height: '100%',
      type: 'treemap',
      breadcrumb: {
        show: false
      },
      label: {
        show: true,
        formatter: labelFormatter,
        rich: {
          a: {
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Inter',
            color: lfxColors.neutral[900],
            lineHeight: 24
          },
          b: {
            fontSize: '24px',
            fontWeight: 600,
            fontFamily: 'Inter',
            color: lfxColors.neutral[900],
            lineHeight: 36
          },
          c: {
            fontSize: '12px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: lfxColors.neutral[900],
            position: ['12', '12']
          }
        },
        color: lfxColors.neutral[900]
      },
      itemStyle: {
        gapWidth: 0,
        borderRadius: 4,
        borderWidth: 4
      },
      emphasis: {
        disabled: true
      },
      roam: false, // prevents scrolling and zooming
      nodeClick: 'link', // prevent focus on click
      visualMin, // minimum value for color mapping
      visualMax, // maximum value for color mapping
      visualDimension: 1, // dimension of the visual map (values should be in array)
      // the second value in the array determines the color of the node
      // data needs to be normalized to the visual min and max
      levels: [
        {
          colorMappingBy: 'value',
          color: [
            lfxColors.neutral[50],
            lfxColors.brand[50],
            lfxColors.brand[100],
            lfxColors.brand[200],
            lfxColors.brand[300]
          ],
          itemStyle: {
            borderColor: '#fff',
            borderRadius: 4,
            gapWidth: 1,
            borderWidth: 4
          }
        }
      ]
    }
  ]
};

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
  options?: ECOption
): ECOption => {
  const config = merge(defaultTreeMapOption, options);
  config.tooltip.formatter = tooltipFormatter;
  config.series[0].data = data;
  return config;
};
