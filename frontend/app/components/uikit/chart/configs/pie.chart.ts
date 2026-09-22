// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { merge } from 'lodash-es';

import { formatNumber } from '~/components/shared/utils/formatter';
import { lfxColors } from '~/config/styles/colors';

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

const defaultDonutOption: ECOption = {
  tooltip: {
    trigger: 'item',
    formatter: (params: unknown) => {
      const { name, value, percent, color } = params as {
        name: string;
        value: number;
        percent: number;
        color: string;
      };
      return `
        <div style="display: flex; flex-direction: row; align-items: center;
          justify-content: space-between; min-width: 200px; font-weight: 400;
          font-size: 12px; color: ${lfxColors.neutral[900]};">
          <span style="font-weight: 400; font-size: 12px; margin-right: 10px;">
            <span style="background-color: ${color}; display: inline-block;
              border-radius: 100%; height: 8px; width: 8px; margin-right: 4px;"></span>
            ${name}
          </span>
          <span style="font-weight: 500; font-size: 12px;">
            ${formatNumber(value)} (${percent}%)
          </span>
        </div>`;
    },
  },
};

/**
 * Get donut chart config. Renders a single-series donut (pie with an inner radius) with each
 * slice colored per `DonutChartData.color`. Tooltip and label show name, value and percent, per
 * ECharts' default pie behavior.
 * @param data - Slices, in the order they should render
 * @param overrideConfig - Additional config to merge
 * @returns Chart config
 */
export const getDonutChartConfig = (
  data: DonutChartData[],
  overrideConfig?: Partial<ECOption>,
): ECOption => {
  const baseConfig: ECOption = {
    ...defaultDonutOption,
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: lfxColors.white,
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12,
          color: lfxColors.neutral[600],
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: lfxColors.neutral[300],
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: lfxColors.neutral[900],
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
          },
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  };

  return overrideConfig ? merge({}, baseConfig, overrideConfig) : baseConfig;
};
