// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxDeltaDisplay from './delta-display.vue';
import type { Summary } from '~~/types/shared/summary.types';

export default {
  title: 'LinuxFoundation/DeltaDisplay',
  component: LfxDeltaDisplay,
  tags: ['autodocs'],
  argTypes: {
    // Props
    summary: {
      description: 'Summary object containing current value, previous value, percentage change, and change value',
      control: 'object'
    },
    isReverse: {
      description: 'Reverses the delta direction (positive becomes negative color and vice versa)',
      defaultValue: false,
      control: 'boolean'
    },
    flipDisplay: {
      description: 'Flips the display order (delta above vs. previous period)',
      defaultValue: false,
      control: 'boolean'
    },
    hidePreviousValue: {
      description: 'Hides the previous value display',
      defaultValue: false,
      control: 'boolean'
    },
    percentageOnly: {
      description: 'Shows only percentage without the absolute change value',
      defaultValue: false,
      control: 'boolean'
    },
    unit: {
      description: 'Unit to display after the numeric values (e.g., "%", "ms", "K")',
      control: 'text'
    },
    isDuration: {
      description: 'Formats values as duration (e.g., "2h 30m")',
      defaultValue: false,
      control: 'boolean'
    },
    isShort: {
      description: 'Uses short number formatting (e.g., "1.2K" instead of "1,200")',
      defaultValue: false,
      control: 'boolean'
    }
  }
};

const createSummary = (current: number, previous: number): Summary => ({
  current,
  previous,
  percentageChange: previous !== 0 ? ((current - previous) / previous) * 100 : undefined,
  changeValue: current - previous,
  periodFrom: '2024-01-01',
  periodTo: '2024-12-31'
});

export const PositiveGrowth = {
  args: {
    summary: createSummary(120, 100),
    isReverse: false
  }
};

export const NegativeGrowth = {
  args: {
    summary: createSummary(85, 100),
    isReverse: false
  }
};

export const WithUnit = {
  args: {
    summary: createSummary(1500, 1200),
    unit: 'ms',
    isReverse: false
  }
};

export const PercentageOnly = {
  args: {
    summary: createSummary(150, 100),
    percentageOnly: true,
    isReverse: false
  }
};

export const ShortFormat = {
  args: {
    summary: createSummary(15000, 12000),
    isShort: true,
    isReverse: false
  }
};

export const Reversed = {
  args: {
    summary: createSummary(120, 100),
    isReverse: true
  }
};

export const Duration = {
  args: {
    summary: createSummary(7200, 3600), // 2 hours vs 1 hour in seconds
    isDuration: true,
    isReverse: false
  }
};

export const FlippedDisplay = {
  args: {
    summary: createSummary(120, 100),
    flipDisplay: true,
    isReverse: false
  }
};

export const HidePrevious = {
  args: {
    summary: createSummary(120, 100),
    hidePreviousValue: true,
    isReverse: false
  }
};
