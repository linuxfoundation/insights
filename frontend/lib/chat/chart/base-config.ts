// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { Config } from "./types";

const sampleConfig: Config = {
  grid: {
    left: '8%',
    right: '0%',
  },
  dataset: {
    source: [
      ['product', '2012', '2013', '2014', '2015'],
      ['Matcha Latte', 41.1, 30.4, 65.1, 53.3],
      ['Milk Tea', 86.5, 92.1, 85.7, 83.1],
      ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4]
    ]
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      fontSize: '12px',
      fontWeight: 'normal',
      rotate: 0
    },
    axisLine: {
      show: false,
    },
    splitLine: { show: false },
    axisTick: { show: false },
  },
  yAxis: {
    alignTicks: true,
    axisLabel: {
      fontSize: '12px',
      fontWeight: 'normal'
    },
    splitLine: {
      lineStyle: {
        type: 'dashed'
      },
      showMinLine: false,
      show: true,
    },
  },
  series: [
    { type: 'bar', seriesLayoutBy: 'row', xAxisIndex: 0, yAxisIndex: 0 },
    { type: 'bar', seriesLayoutBy: 'row', xAxisIndex: 0, yAxisIndex: 0 },
    { type: 'bar', seriesLayoutBy: 'row', xAxisIndex: 0, yAxisIndex: 0 },
  ],
};

export default sampleConfig;