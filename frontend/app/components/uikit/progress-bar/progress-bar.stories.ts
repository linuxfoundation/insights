// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxProgressBar from './progress-bar.vue';

export default {
  title: 'LinuxFoundation/ProgressBar',
  component: LfxProgressBar,
  tags: ['autodocs'],
  argTypes: {
    values: {
      description: 'Array of percentage values to display (each value represents a segment of the bar)',
      control: 'object'
    },
    size: {
      description: 'Size of the progress bar',
      control: 'select',
      options: ['small', 'normal']
    },
    color: {
      description: 'Color theme of the progress bar',
      control: 'select',
      options: ['normal', 'positive', 'warning', 'negative']
    },
    label: {
      description: 'Label text to display inside the progress bar',
      control: 'text'
    },
    hideEmpty: {
      description: 'Hides the empty portion of the progress bar',
      control: 'boolean'
    }
  }
};

export const Default = {
  args: {
    values: [50],
    color: 'normal',
    size: 'normal',
    hideEmpty: false
  }
};

export const WithLabel = {
  args: {
    values: [75],
    color: 'normal',
    size: 'normal',
    label: '75%'
  }
};

export const MultipleValues = {
  args: {
    values: [30, 20, 15],
    color: 'normal',
    size: 'normal'
  }
};

export const Small = {
  args: {
    values: [60],
    color: 'normal',
    size: 'small',
    hideEmpty: false
  }
};

export const HideEmpty = {
  args: {
    values: [40],
    color: 'normal',
    size: 'normal',
    hideEmpty: true
  }
};

export const Positive = {
  args: {
    values: [80],
    color: 'positive',
    size: 'normal',
    label: 'Success'
  }
};

export const Warning = {
  args: {
    values: [50],
    color: 'warning',
    size: 'normal',
    label: 'Warning'
  }
};

export const Negative = {
  args: {
    values: [25],
    color: 'negative',
    size: 'normal',
    label: 'Low'
  }
};

export const MultipleSegments = {
  args: {
    values: [25, 30, 20],
    color: 'normal',
    size: 'normal',
    label: '75% Total'
  }
};
