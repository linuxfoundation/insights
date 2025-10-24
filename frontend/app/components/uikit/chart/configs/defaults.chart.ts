// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { GaugeSeriesOption } from 'echarts';
import { axisLabelFormatter } from '../helpers/formatters';
import type { CategoryData } from '../types/ChartTypes';
import { formatNumberShort } from '~/components/shared/utils/formatter';
import { lfxColors } from '~/config/styles/colors';

const defaultOption: ECOption = {
  grid: {
    left: '8%',
    right: 0,
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      align: 'center',
      formatter: axisLabelFormatter('{MMM} {yy}'),
      hideOverlap: true,
      fontSize: '12px',
      fontWeight: 'normal',
      color: lfxColors.neutral[400], // TODO: change this when we have the correct color
      // the designs are currently using a color hex not defined in the design system
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
      fontWeight: 'normal',
      color: lfxColors.neutral[400],
      formatter: (value: number, index: number) => (index === 0 ? '' : formatNumberShort(value)),
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: lfxColors.neutral[200],
      },
      showMinLine: false,
      show: true,
    },
    min: (value: { min: number; max: number }) => {
      const range = value.max - value.min;
      const step = roundOff(range / 5);
      return Math.max(0, value.min - step);
    },
    max: (value: { min: number; max: number }) => {
      const range = value.max - value.min;
      const step = roundOff(range / 5);
      const newMax = Math.ceil(value.max / step) * step;

      if (newMax % step !== 0) {
        return newMax + step;
      }

      return newMax;
    },
    splitNumber: 5,
  },
};

// this is step
const roundOff = (step: number) => {
  if (step <= 10) {
    return (
      Math.ceil(step / 10 ** Math.floor(Math.log10(step))) * 10 ** Math.floor(Math.log10(step))
    );
  }

  if (step <= 50) {
    return Math.ceil(step / 10) * 10;
  }

  if (step <= 100) {
    return Math.ceil(step / 50) * 50;
  }

  if (step <= 500) {
    return Math.ceil(step / 100) * 100;
  }

  if (step <= 1000) {
    return Math.ceil(step / 500) * 500;
  }

  if (step <= 5000) {
    return Math.ceil(step / 1000) * 1000;
  }

  if (step <= 10000) {
    return Math.ceil(step / 5000) * 5000;
  }

  if (step <= 50000) {
    return Math.ceil(step / 10000) * 10000;
  }

  if (step <= 100000) {
    return Math.ceil(step / 50000) * 50000;
  }

  if (step <= 1000000) {
    return Math.ceil(step / 100000) * 100000;
  }

  if (step <= 10000000) {
    return Math.ceil(step / 1000000) * 1000000;
  }

  if (step <= 100000000) {
    return Math.ceil(step / 10000000) * 10000000;
  }

  return Math.ceil(step / 100000000) * 100000000;
};

export const minHours = (value: { min: number; max: number }) => {
  // Convert hours to minutes for more granular calculation
  const minMinutes = value.min * 60;
  const maxMinutes = value.max * 60;
  const rangeMinutes = maxMinutes - minMinutes;

  // Calculate step size in minutes (divide range into 5 segments)
  const stepMinutes = Math.ceil(rangeMinutes / 5);

  // Round step to nearest hour if > 2 hours, otherwise keep in minutes
  const roundedStepMinutes =
    stepMinutes > 120 ? Math.ceil(stepMinutes / 60) * 60 : Math.ceil(stepMinutes / 15) * 15;

  // Convert back to hours
  return Math.max(0, (minMinutes - roundedStepMinutes) / 60);
};

export const maxHours = (value: { min: number; max: number }) => {
  // Convert hours to minutes
  const minMinutes = value.min * 60;
  const maxMinutes = value.max * 60;
  const rangeMinutes = maxMinutes - minMinutes;

  // Calculate step size in minutes
  const stepMinutes = Math.ceil(rangeMinutes / 5);

  // Round step to nearest hour if > 2 hours, otherwise keep in minutes
  const roundedStepMinutes =
    stepMinutes > 120 ? Math.ceil(stepMinutes / 60) * 60 : Math.ceil(stepMinutes / 15) * 15;

  // Convert back to hours and round up
  return Math.ceil((maxMinutes + roundedStepMinutes) / 60);
};

export const defaultGraphOnlyOption: ECOption = {
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLabel: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    splitLine: { show: false },
    axisTick: { show: false },
  },
  yAxis: {
    show: false,
  },
};

export const defaultGaugeSeriesStyle: GaugeSeriesOption = {
  type: 'gauge',
  pointer: {
    show: false,
  },
  progress: {
    show: true,
    overlap: false,
    roundCap: true,
    clip: false,
  },
  axisLine: {
    lineStyle: {
      width: 8,
    },
  },
  splitLine: {
    show: false,
    distance: 0,
    length: 10,
  },
  axisTick: {
    show: false,
  },
  axisLabel: {
    show: false,
    distance: 50,
  },
};

export const categoryData: CategoryData = {
  xAxis: [
    { key: 'Mon', value: 0 },
    { key: 'Tue', value: 1 },
    { key: 'Wed', value: 2 },
    { key: 'Thu', value: 3 },
    { key: 'Fri', value: 4 },
    { key: 'Sat', value: 5 },
    { key: 'Sun', value: 6 },
  ],
  yAxis: [
    { key: '8:00', value: 8 },
    { key: '10:00', value: 10 },
    { key: '12:00', value: 12 },
    { key: '14:00', value: 14 },
    { key: '16:00', value: 16 },
    { key: '18:00', value: 18 },
    { key: '20:00', value: 20 },
    { key: '22:00', value: 22 },
    { key: '0:00+1', value: 0 },
    { key: '2:00+1', value: 2 },
    { key: '4:00+1', value: 4 },
    { key: '6:00+1', value: 6 },
  ],
};

export default defaultOption;
