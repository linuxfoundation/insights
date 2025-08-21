// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { Config } from "./types";
import { lfxColors } from "~/config/styles/colors";

const sampleConfig: Config = {
  title: {
    text: 'Chart Title',
    left: 'center',
    textStyle: {
      fontFamily: 'Roboto Slab',
      fontWeight: '700',
      fontSize: 16,
      color: lfxColors.black,
    },
  },
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
  legend: {
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    itemWidth: 15,
    itemHeight: 15,
    itemGap: 40,
    textStyle: {
      fontSize: 12,
      fontWeight: 'normal',
      color: lfxColors.black,
      fontFamily: 'Inter',
    },
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      fontSize: 12,
      fontWeight: 'normal',
      color: lfxColors.neutral[400],
      fontFamily: 'Inter',
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
      fontSize: 12,
      fontWeight: 'normal',
      color: lfxColors.neutral[400],
      fontFamily: 'Inter',
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